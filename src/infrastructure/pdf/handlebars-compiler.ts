import { readFile } from "fs/promises";

import Handlebars from "handlebars";

export class HandlebarsCompiler {
  async compileTemplateByPath<T>(
    templatePath: string,
    data: T,
  ): Promise<string> {
    const templateSource = await readFile(templatePath, {
      encoding: "utf8",
    });

    const template = Handlebars.compile(templateSource);

    return template(data);
  }

  compileTemplate<T>(templateSource: string, data: T): string {
    const template = Handlebars.compile(templateSource);

    return template(data);
  }
}
