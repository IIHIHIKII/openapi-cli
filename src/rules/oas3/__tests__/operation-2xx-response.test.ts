import { outdent } from 'outdent';

import { LintConfig } from '../../../config/config';

import { validateDocument } from '../../../validate';
import { parseYamlToDocument, replaceSourceWithRef } from '../../../__tests__/utils';

describe('OAS3 operation-2xx-response', () => {
  it('should report missing 2xx response', async () => {
    const document = parseYamlToDocument(
      outdent`
          openapi: 3.0.0
          paths:
            '/test':
              put:
                responses:
                  400:
                    description: bad response
        `,
      'foobar.yaml',
    );

    const results = await validateDocument({
      document,
      config: new LintConfig({ extends: [], rules: { 'operation-2xx-response': 'error' } }),
    });

    expect(replaceSourceWithRef(results)).toMatchInlineSnapshot(`
      Array [
        Object {
          "location": Array [
            Object {
              "pointer": "#/paths/~1test/put/responses",
              "reportOnKey": true,
              "source": "foobar.yaml",
            },
          ],
          "message": "Operation must have at least one \`2xx\` response.",
          "ruleId": "operation-2xx-response",
          "severity": "error",
          "suggest": Array [],
        },
      ]
    `);
  });

  it('should not report for present 2xx response', async () => {
    const document = parseYamlToDocument(
      outdent`
          openapi: 3.0.0
          paths:
            '/test/':
              put:
                responses:
                  200:
                    description: ok
        `,
      'foobar.yaml',
    );

    const results = await validateDocument({
      document,
      config: new LintConfig({ extends: [], rules: { 'operation-2xx-response': 'error' } }),
    });

    expect(replaceSourceWithRef(results)).toMatchInlineSnapshot(`Array []`);
  });

  it('should not report for present default', async () => {
    const document = parseYamlToDocument(
      outdent`
          openapi: 3.0.0
          paths:
            '/test/':
              put:
                responses:
                  default:
                    description: ok
        `,
      'foobar.yaml',
    );

    const results = await validateDocument({
      document,
      config: new LintConfig({ extends: [], rules: { 'operation-2xx-response': 'error' } }),
    });

    expect(replaceSourceWithRef(results)).toMatchInlineSnapshot(`Array []`);
  });
});