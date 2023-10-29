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

    parser.processChunk(jsonString);

    parser.end();

    expect(tokens).toEqual([
      { type: "BEGIN_OBJECT", index: 0, depth: 0 },
      { type: "BEGIN_OBJECT", key: "glossary", index: 1, depth: 1 },
      {
        type: "STRING",
        value: "example glossary",
        index: 2,
        depth: 2,
        key: "title",
      },
      { type: "NUMBER", value: 2, index: 3, depth: 2, key: "p2" },
      { type: "BEGIN_ARRAY", key: "empty", index: 4, depth: 2 },
      { type: "STRING", value: "empty1", index: 5, depth: 3, key: 0 },
      { type: "STRING", value: "empty2", index: 6, depth: 3, key: 1 },
      { type: "END_ARRAY", index: 7, depth: 2 },
      { type: "END_OBJECT", index: 8, depth: 1 },
      { type: "END_OBJECT", index: 9, depth: 0 },
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

    parser.processChunk(jsonString);

    expect(tokens).toEqual([
      { type: "BEGIN_OBJECT", depth: 0, index: 0 },
      { type: "STRING", value: "John", depth: 1, key: "name", index: 1 },
      { type: "NUMBER", value: 30, depth: 1, key: "age", index: 2 },
      { type: "STRING", value: "New York", depth: 1, key: "city", index: 3 },
      { type: "BEGIN_ARRAY", key: "pets", depth: 1, index: 4 },
      { type: "BEGIN_OBJECT", key: 0, depth: 2, index: 5 },
      { type: "STRING", value: "Fluffy", depth: 3, key: "name", index: 6 },
      { type: "STRING", value: "cat", depth: 3, key: "type", index: 7 },
      { type: "END_OBJECT", depth: 2, index: 8 },
      { type: "BEGIN_OBJECT", key: 1, depth: 2, index: 9 },
      { type: "STRING", value: "Fido", depth: 3, key: "name", index: 10 },
      { type: "STRING", value: "dog", depth: 3, key: "type", index: 11 },
      { type: "END_OBJECT", depth: 2, index: 12 },
      { type: "END_ARRAY", depth: 1, index: 13 },
      { type: "BEGIN_OBJECT", key: "address", depth: 1, index: 14 },
      {
        type: "STRING",
        value: "123 Main St",
        depth: 2,
        key: "street",
        index: 15,
      },
      { type: "STRING", value: "Anytown", depth: 2, key: "city", index: 16 },
      { type: "STRING", value: "CA", depth: 2, key: "state", index: 17 },
      { type: "STRING", value: "12345", depth: 2, key: "zip", index: 18 },
      { type: "END_OBJECT", depth: 1, index: 19 },
      { type: "END_OBJECT", depth: 0, index: 20 },
    ]);

    parser.end();
  });

  it("Should throw an error when parsing invalid JSON", () => {
    const parser = new JsonStreamTokenizer();
    const tokens: any[] = [];
    const invalidJson = fs.readFileSync("./__test__/invalid.json", "utf8");

    parser.subscribe((token) => {
      tokens.push(token);
    });

    const jsonString = invalidJson;

    expect(() => {
      parser.processChunk(jsonString);
      parser.end();
    }).toThrowError("Unexpected end of input");
  });

  it("Should parse the valid JSON file pokedex.json", () => {
    const parser = new JsonStreamTokenizer();
    const tokens: any[] = [];
    const validJson = fs.readFileSync("./__test__/pokedex.json", "utf8");

    parser.subscribe((token) => {
      tokens.push(token);
    });

    const jsonString = validJson;

    expect(() => {
      for (let char of jsonString) {
        parser.processChar(char);
      }
      parser.end();
    }).not.toThrowError();
  });

  it("Should parse the valid JSON file small.json", () => {
    const parser = new JsonStreamTokenizer();
    const tokens: any[] = [];
    const validJson = fs.readFileSync("./__test__/small.json", "utf8");

    parser.subscribe((token) => {
      tokens.push(token);
    });

    const jsonString = validJson;

    expect(() => {
      for (let char of jsonString) {
        parser.processChar(char);
      }
      parser.end();
    }).not.toThrowError();
  });

  it("Should parse the valid JSON file nullreference.json", () => {
    const parser = new JsonStreamTokenizer();
    const tokens: any[] = [];
    const validJson = fs.readFileSync("./__test__/nullreference.json", "utf8");

    parser.subscribe((token) => {
      tokens.push(token);
    });

    const jsonString = validJson;

    expect(() => {
      for (let char of jsonString) {
        parser.processChar(char);
      }
      parser.end();
    }).not.toThrowError();
  });

  it("Should parse the valid JSON file startwitharray.json", () => {
    const parser = new JsonStreamTokenizer();
    const tokens: any[] = [];
    const validJson = fs.readFileSync("./__test__/startwitharray.json", "utf8");

    parser.subscribe((token) => {
      tokens.push(token);
    });

    expect(() => {
      for (let char of validJson) {
        parser.processChar(char);
      }
      parser.end();
    }).not.toThrowError();
  });

  it("Should parse the valid JSON file large.json", () => {
    const parser = new JsonStreamTokenizer();
    const tokens: any[] = [];
    const validJson = fs.readFileSync("./__test__/large.json", "utf8");

    expect(() => {
      JSON.parse(validJson);
    }).not.toThrowError();

    parser.subscribe((token) => {
      tokens.push(token);
    });

    const jsonString = validJson;

    expect(() => {
      for (let char of jsonString) {
        parser.processChar(char);
      }
      parser.end();
    }).not.toThrowError();
  });

  it("Should parse the valid JSON file giant.json", () => {
    const parser = new JsonStreamTokenizer();
    const validJson = fs.readFileSync("./__test__/giant.json", "utf8");

    const jsonString = validJson;

    expect(() => {
      parser.processChunk(jsonString);
      parser.end();
    }).not.toThrowError();
  });
});
