import * as fs from 'fs';
import * as path from 'path';

export class TemplateLoader {
  static load(
    template: string,
    context: Record<
      string,
      string | number | boolean
    > = {},
  ): string {
    const templatePath = path.join(
      process.cwd(),
      'src',
      'modules',
      'mail',
      'templates',
      `${template}.html`,
    );

    let html = fs.readFileSync(
      templatePath,
      'utf8',
    );

    for (const [key, value] of Object.entries(
      context,
    )) {
      const regex = new RegExp(
        `{{\\s*${key}\\s*}}`,
        'g',
      );

      html = html.replace(
        regex,
        String(value),
      );
    }

    return html;
  }
}