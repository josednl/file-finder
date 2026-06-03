export class IgnoreManager {
  private rules: RegExp[] = [];

  constructor(patterns: string[] = []) {
    this.addPatterns(patterns);
  }

  addPatterns(patterns: string[]) {
    for (const pattern of patterns) {
      if (pattern.trim() && !pattern.startsWith('#')) {
        this.rules.push(this.patternToRegex(pattern.trim()));
      }
    }
  }

  shouldIgnore(name: string): boolean {
    return this.rules.some(regex => regex.test(name));
  }

  private patternToRegex(pattern: string): RegExp {
    // Simple gitignore-like conversion
    let regexStr = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex chars
      .replace(/\*/g, '.*')               // * -> .*
      .replace(/\?/g, '.');                // ? -> .

    // If it doesn't have a slash, it can match anywhere
    if (!pattern.includes('/')) {
      return new RegExp(regexStr);
    }

    // Handle directory specific (ending with /)
    if (pattern.endsWith('/')) {
      regexStr = regexStr.slice(0, -2) + '(/.*)?$';
    } else {
      regexStr = regexStr + '$';
    }

    return new RegExp(regexStr);
  }
}
