export class StaticValueException extends Error {
  public returnValue: any;

  constructor(returnValue: any, message?: string) {
    super(message || `Static value: ${returnValue}`);
    this.name = 'StaticValueException';
    this.returnValue = returnValue;
  }
}

export class ElementNotFoundInHtml extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ElementNotFoundInHtml';
  }
}

export class SchemaOrgException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchemaOrgException';
  }
}

export class FieldNotProvidedByWebsiteException extends Error {
  public returnValue: any;

  constructor(returnValue: any, message?: string) {
    super(message || `Field not provided by website: ${returnValue}`);
    this.name = 'FieldNotProvidedByWebsiteException';
    this.returnValue = returnValue;
  }
}