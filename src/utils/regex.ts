/* eslint-disable no-useless-escape */
/* eslint-disable prefer-regex-literals */
export default class Validate {
  private static regex: RegExp;

  static email(email: string): boolean {
    this.regex = new RegExp(
      /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim,
    );

    return this.regex.test(email);
  }

  static password(password: string): boolean {
    // Contain at least one uppercase letter, one lowercase letter and one number. Be at min 8 and max 25 characters long. Accept special character.
    this.regex = new RegExp(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[\w~@#$%^&*+=`|{}:;!.?\"()\[\]-]{8,25}$/,
    );

    return this.regex.test(password);
  }

  static pseudo(pseudo: string): boolean {
    this.regex = new RegExp(/^[a-zA-Z0-9]+$/);

    return this.regex.test(pseudo);
  }
}
