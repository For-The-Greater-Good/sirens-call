#!/usr/bin/env python3
"""
Enhanced parallel translation script for Plentiful Providers locale files
Uses Claude claude-opus-4-1-20250805 with food pantry management context and parallel processing
Now includes surrounding context for better translation accuracy
"""

import json
import subprocess
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Dict, Tuple, List
import argparse

# Language mappings
LANGUAGES = {
    "ar-SA": "Arabic",
    "bn-BD": "Bengali",
    "es-ES": "Spanish",
    "ht-HT": "Haitian Creole",
    "ko-KR": "Korean",
    "ru-RU": "Russian",
    "ur-PK": "Urdu",
    "zh-CN": "Chinese (Simplified)"
}

# Global lock for thread-safe progress reporting
progress_lock = threading.Lock()

def get_context_window(items: List[Tuple[str, str]], current_index: int, window_size: int = 20) -> Dict[str, str]:
    """Get surrounding context for a translation"""
    start_idx = max(0, current_index - window_size)
    end_idx = min(len(items), current_index + window_size + 1)

    context_before = []
    context_after = []

    # Get context before
    for i in range(start_idx, current_index):
        key, value = items[i]
        context_before.append(f"  {key}: {value}")

    # Get context after
    for i in range(current_index + 1, end_idx):
        key, value = items[i]
        context_after.append(f"  {key}: {value}")

    return {
        "before": context_before,
        "after": context_after,
        "current_key": items[current_index][0] if current_index < len(items) else "",
        "position": f"{current_index + 1}/{len(items)}"
    }

def prepare_translation_input(english_text: str, target_language: str, context: Dict[str, str]) -> Dict:
    """Prepare structured input for Claude using stream-json format"""

    # Build context arrays
    context_before = context.get("before", [])[-10:]  # Last 10 items
    context_after = context.get("after", [])[:10]  # First 10 items

    return {
        "task": "translation",
        "target_language": target_language,
        "text_to_translate": english_text,
        "current_key": context.get('current_key', 'unknown'),
        "position": context.get('position', 'unknown'),
        "context": {
            "application": "Plentiful Providers - Food Pantry Management System",
            "users": "Food pantry staff, volunteers, and administrators",
            "audience": "Community members seeking food assistance (referred to as 'neighbors')",
            "preceding_keys": context_before,
            "following_keys": context_after
        },
        "guidelines": {
            "terminology": {
                "use_neighbors": "Use 'neighbors' instead of 'clients' for service recipients",
                "tone": "Professional but warm and welcoming",
                "accessibility": "Ensure clarity for diverse communities"
            },
            "technical": {
                "preserve_variables": "Keep all placeholder variables exactly (e.g., {{var_1}}, {{senior_age_threshold}})",
                "formatting": "Maintain punctuation and formatting",
                "ui_constraints": "Keep button text concise for interface constraints"
            }
        },
        "instructions": "Translate ONLY the 'text_to_translate' field to the target language. Return only the translated text, nothing else."
    }

def get_system_prompt() -> str:
    """Get the system prompt for translation context"""
    return """You are a professional translator for Plentiful Providers, a food pantry management system.

Key features include:
- Neighbor check-in and household management
- Appointment scheduling and reservations
- Messaging system for service updates
- TEFAP (emergency food assistance) compliance
- Service capacity management and reporting

When you receive a JSON input with translation request, extract the 'text_to_translate' field and translate it according to the provided context and guidelines. Return ONLY the translated text."""

def translate_text(english_text: str, target_language: str, key: str, context: Dict[str, str], model: str = "claude-opus-4-1-20250805") -> str:
    """Translate text using Claude CLI with JSON input/output formats and context"""
    if not english_text.strip():
        return english_text

    # Prepare structured input
    input_data = prepare_translation_input(english_text, target_language, context)
    system_prompt = get_system_prompt()

    try:
        # Create a formatted message for Claude
        input_message = f"""Please translate the following JSON request:

{json.dumps(input_data, indent=2)}

Return ONLY the translated text, nothing else."""

        result = subprocess.run(
            [
                'claude', '-p',
                '--model', model,
                '--append-system-prompt', system_prompt
            ],
            input=input_message,
            capture_output=True,
            text=True,
            timeout=60  # Increased timeout for opus model
        )

        if result.returncode == 0:
            output = result.stdout.strip()

            # The output should be the direct translation text
            translation = output

            # Clean up the translation
            if translation and translation.lower() not in ["null", "none", ""]:
                # Remove any quotes that might wrap the response
                translation = translation.strip('"').strip("'")

                # If the output is still JSON (shouldn't be, but just in case)
                if translation.startswith('{') and translation.endswith('}'):
                    try:
                        inner_json = json.loads(translation)
                        if 'translation' in inner_json:
                            translation = inner_json['translation']
                    except:
                        pass

                return translation

        # Log error for debugging
        if result.stderr:
            print(f"    Claude error for '{key}': {result.stderr.strip()}")

    except subprocess.TimeoutExpired:
        print(f"    Timeout translating '{key}' to {target_language}")
    except Exception as e:
        print(f"    Error translating '{key}': {e}")

    # Return original if translation fails
    print(f"    ⚠️  Translation failed for '{key}', using original text")
    return english_text

def process_language(
    lang_code: str,
    language_name: str,
    source_data: Dict[str, str],
    test_mode: bool = False,
    model: str = "claude-opus-4-1-20250805",
    backup: bool = True,
    context_window: int = 20,
    verbose: bool = False
) -> Tuple[str, bool, int]:
    """Process one language with progress tracking and context awareness"""

    global args  # Make args accessible for verbose check
    args = type('obj', (object,), {'verbose': verbose})()

    # Convert to list to maintain order and allow indexing
    all_items = list(source_data.items())

    # Determine how many keys to process
    if test_mode:
        items_to_process = all_items[:10]  # Only first 10 keys for testing
    else:
        items_to_process = all_items

    target_dir = Path(f"src/files/locales/{lang_code}")
    target_dir.mkdir(parents=True, exist_ok=True)
    target_file = target_dir / "main.json"

    # Backup existing file if it exists
    if backup and target_file.exists():
        backup_file = target_file.with_suffix('.json.backup')
        backup_file.write_text(target_file.read_text(encoding='utf-8'), encoding='utf-8')

    translated_data = {}
    total = len(items_to_process)
    errors = 0

    with progress_lock:
        print(f"\n🚀 Starting {language_name} ({lang_code}) - {total} keys")

    for i, (key, value) in enumerate(items_to_process):
        with progress_lock:
            print(f"  [{lang_code}] [{i+1}/{total}] {key}")

        try:
            # Get context from surrounding keys
            context = get_context_window(all_items, i, context_window)

            translated_value = translate_text(value, language_name, key, context, model)
            translated_data[key] = translated_value

            # Add delay to avoid overwhelming the API (slightly longer for opus model)
            time.sleep(0.7)

        except Exception as e:
            with progress_lock:
                print(f"    ❌ Failed to translate '{key}': {e}")
            translated_data[key] = value  # Use original on error
            errors += 1

    # If not in test mode, include all remaining keys with original values
    if not test_mode:
        for key, value in source_data.items():
            if key not in translated_data:
                translated_data[key] = value

    # Write the translated file with proper formatting
    try:
        with open(target_file, 'w', encoding='utf-8') as f:
            json.dump(translated_data, f, ensure_ascii=False, indent=2)

        with progress_lock:
            if errors > 0:
                print(f"⚠️  Completed {language_name} with {errors} errors")
            else:
                print(f"✅ Completed {language_name}")

        return lang_code, True, errors

    except Exception as e:
        with progress_lock:
            print(f"❌ Failed to write {language_name} file: {e}")
        return lang_code, False, errors

def validate_translations(source_data: Dict[str, str], test_mode: bool = False) -> None:
    """Validate that all translation files have correct structure"""
    print("\n🔍 Validating translation files...")

    expected_keys = set(source_data.keys())
    if test_mode:
        expected_keys = set(list(source_data.keys())[:10])

    for lang_code in LANGUAGES.keys():
        target_file = Path(f"src/files/locales/{lang_code}/main.json")

        if not target_file.exists():
            print(f"  ❌ {lang_code}: File missing")
            continue

        try:
            with open(target_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            actual_keys = set(data.keys())

            if test_mode:
                # In test mode, check if we have at least the expected keys
                missing = expected_keys - actual_keys
                if missing:
                    print(f"  ❌ {lang_code}: Missing {len(missing)} keys")
                else:
                    print(f"  ✅ {lang_code}: All {len(expected_keys)} test keys present")
            else:
                # In full mode, check exact match
                if actual_keys == expected_keys:
                    print(f"  ✅ {lang_code}: All {len(expected_keys)} keys present")
                else:
                    missing = expected_keys - actual_keys
                    extra = actual_keys - expected_keys
                    if missing:
                        print(f"  ❌ {lang_code}: Missing {len(missing)} keys")
                    if extra:
                        print(f"  ⚠️  {lang_code}: {len(extra)} extra keys")

        except Exception as e:
            print(f"  ❌ {lang_code}: Error reading file - {e}")

def main():
    parser = argparse.ArgumentParser(description='Translate Plentiful Providers locale files with context awareness')
    parser.add_argument('--test', action='store_true',
                       help='Test mode: only translate first 10 keys')
    parser.add_argument('--model', default='claude-opus-4-1-20250805',
                       help='Claude model to use (default: claude-opus-4-1-20250805)')
    parser.add_argument('--threads', type=int, default=4,
                       help='Number of concurrent threads (default: 4, reduced for opus model)')
    parser.add_argument('--no-backup', action='store_true',
                       help='Skip backing up existing files')
    parser.add_argument('--languages', nargs='+',
                       help='Specific languages to translate (e.g., es-ES ko-KR)')
    parser.add_argument('--context-window', type=int, default=20,
                       help='Number of keys before/after to include as context (default: 20)')
    parser.add_argument('--verbose', action='store_true',
                       help='Enable verbose output for debugging')

    args = parser.parse_args()

    # Check dependencies
    try:
        result = subprocess.run(['claude', '--version'], capture_output=True, check=True)
        print(f"✅ Claude CLI found: {result.stdout.decode().strip()}")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Error: claude command not found")
        sys.exit(1)

    # Load source file
    source_file = Path("src/files/locales/en-US/main.json")
    if not source_file.exists():
        print(f"❌ Error: Source file {source_file} not found")
        sys.exit(1)

    with open(source_file, 'r', encoding='utf-8') as f:
        source_data = json.load(f)

    # Filter languages if specified
    languages_to_process = LANGUAGES
    if args.languages:
        languages_to_process = {k: v for k, v in LANGUAGES.items() if k in args.languages}
        if not languages_to_process:
            print(f"❌ No valid languages found in: {args.languages}")
            print(f"Available: {list(LANGUAGES.keys())}")
            sys.exit(1)

    # Print configuration
    print("🌍 Plentiful Providers Translation Script (Enhanced with Context)")
    print(f"📄 Source: {source_file} ({len(source_data)} keys)")
    print(f"🤖 Model: {args.model}")
    print(f"🧵 Threads: {args.threads}")
    print(f"📖 Context window: ±{args.context_window} keys")
    print(f"🔬 Test mode: {'Yes (10 keys)' if args.test else 'No (all keys)'}")
    print(f"🗂️  Languages: {list(languages_to_process.keys())}")
    print(f"💾 Backup: {'No' if args.no_backup else 'Yes'}")

    if args.test:
        print("⚠️  TEST MODE: Only translating first 10 keys")

    # Start timing
    start_time = time.time()

    # Process languages in parallel
    with ThreadPoolExecutor(max_workers=args.threads) as executor:
        # Submit all translation tasks
        future_to_lang = {
            executor.submit(
                process_language,
                lang_code,
                language_name,
                source_data,
                args.test,
                args.model,
                not args.no_backup,
                args.context_window,
                args.verbose
            ): lang_code
            for lang_code, language_name in languages_to_process.items()
        }

        # Collect results
        results = {}
        for future in as_completed(future_to_lang):
            lang_code, success, errors = future.result()
            results[lang_code] = (success, errors)

    # Calculate timing
    elapsed = time.time() - start_time

    # Print summary
    print(f"\n📊 Translation Summary ({elapsed:.1f}s)")
    print("=" * 50)

    successful = 0
    total_errors = 0

    for lang_code, (success, errors) in results.items():
        status = "✅" if success else "❌"
        error_text = f" ({errors} errors)" if errors > 0 else ""
        print(f"{status} {lang_code}: {LANGUAGES[lang_code]}{error_text}")
        if success:
            successful += 1
        total_errors += errors

    print(f"\n📈 Results: {successful}/{len(languages_to_process)} languages completed")
    if total_errors > 0:
        print(f"⚠️  Total errors: {total_errors}")

    # Validate results
    validate_translations(source_data, args.test)

    print("\n🎉 Translation complete!")
    if args.test:
        print("💡 Run without --test flag to translate all keys")

if __name__ == "__main__":
    main()