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

  static date(date: string): boolean {
    // Contain at least one uppercase letter, one lowercase letter and one number. Be at min 8 and max 25 characters long. Accept special character.
    this.regex = new RegExp(
      /(^(((0[1-9]|1[0-9]|2[0-8])[\/](0[1-9]|1[012]))|((29|30|31)[\/](0[13578]|1[02]))|((29|30)[\/](0[4,6,9]|11)))[\/](19|[2-9][0-9])\d\d$)|(^29[\/]02[\/](19|[2-9][0-9])(00|04|08|12|16|20|24|28|32|36|40|44|48|52|56|60|64|68|72|76|80|84|88|92|96)$)/,
    );

    return this.regex.test(date);
  }

  static pseudo(pseudo: string): boolean {
    this.regex = new RegExp(/^[a-zA-Z0-9]+$/);

    return this.regex.test(pseudo);
  }
}
