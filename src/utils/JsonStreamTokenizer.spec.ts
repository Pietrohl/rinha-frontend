import { JsonStreamTokenizer } from "./JsonStreamTokenizer";
import { describe, it, expect } from "vitest";
import fs from "fs";



describe("JsonStreamTokenizer", () => {
  it("should parse a simple JSON object", () => {
    const parser = new JsonStreamTokenizer();
    const tokens: any[] = [];

    parser.subscribe((token) => {
      tokens.push(token);
    });

    const jsonString = `{
        "glossary": {
            "title": "example glossary",
            "p2": 2,
            "empty": [
                "empty1",
                "empty2"
            ]
        }
    }`;

    for (let char of jsonString) {
      parser.processChar(char);
    }

    parser.end();

    expect(tokens).toEqual([
      { type: "BEGIN_OBJECT", depth: 0 },
      { type: "BEGIN_OBJECT", key: "glossary", depth: 1 },
      { type: "string", value: "example glossary", depth: 1, key: "title" },
      { type: "string", value: 2, depth: 1, key: "p2" },
      { type: "BEGIN_ARRAY", key: "empty", depth: 1 },
      { type: "string", value: "empty1", depth: 1, key: 0 },
      { type: "string", value: "empty2", depth: 1, key: 1 },
      { type: "END_ARRAY", depth: 1 },
      { type: "END_OBJECT", depth: 0 },
    ]);
  });

  it("should parse a JSON object with nested objects and arrays", () => {
    const parser = new JsonStreamTokenizer();
    const tokens: any[] = [];

    parser.subscribe((token) => {
      tokens.push(token);
    });

    const jsonString = `{
            "name": "John",
            "age": 30,
            "city": "New York",
            "pets": [
                {
                    "name": "Fluffy",
                    "type": "cat"
                },
                {
                    "name": "Fido",
                    "type": "dog"
                }
            ],
            "address": {
                "street": "123 Main St",
                "city": "Anytown",
                "state": "CA",
                "zip": "12345"
            }
        }`;

    for (let char of jsonString) {
      parser.processChar(char);
    }

    parser.end();
  });

  it("Should throw an error when parsing invalid JSON", () => {
    const parser = new JsonStreamTokenizer();
    const tokens: any[] = [];
    const invalidJson =  fs.readFileSync("./__test__/invalid.json", "utf8");

    parser.subscribe((token) => {
      tokens.push(token);
    });

    const jsonString = invalidJson;

    expect(() => {
      for (let char of jsonString) {
        parser.processChar(char);
      }
    }).toThrowError("Unexpected character at start");
  });
});
