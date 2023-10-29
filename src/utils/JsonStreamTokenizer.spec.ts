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
      { type: "string", value: "example glossary", depth: 2, key: "title" },
      { type: "number", value: 2, depth: 2, key: "p2" },
      { type: "BEGIN_ARRAY", key: "empty", depth: 2 },
      { type: "string", value: "empty1", depth: 3, key: 0 },
      { type: "string", value: "empty2", depth: 3, key: 1 },
      { type: "END_ARRAY", depth: 2 },
      { type: "END_OBJECT", depth: 1 },
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

    expect(tokens).toEqual([
      { type: "BEGIN_OBJECT", depth: 0 },
      { type: "string", value: "John", depth: 1, key: "name" },
      { type: "number", value: 30, depth: 1, key: "age" },
      { type: "string", value: "New York", depth: 1, key: "city" },
      { type: "BEGIN_ARRAY", key: "pets", depth: 1 },
      { type: "BEGIN_OBJECT", key: 0, depth: 2 },
      { type: "string", value: "Fluffy", depth: 3, key: "name" },
      { type: "string", value: "cat", depth: 3, key: "type" },
      { type: "END_OBJECT", depth: 2 },
      { type: "BEGIN_OBJECT", key: 1, depth: 2 },
      { type: "string", value: "Fido", depth: 3, key: "name" },
      { type: "string", value: "dog", depth: 3, key: "type" },
      { type: "END_OBJECT", depth: 2 },
      { type: "END_ARRAY", depth: 1 },
      { type: "BEGIN_OBJECT", key: "address", depth: 1 },
      { type: "string", value: "123 Main St", depth: 2, key: "street" },
      { type: "string", value: "Anytown", depth: 2, key: "city" },
      { type: "string", value: "CA", depth: 2, key: "state" },
      { type: "string", value: "12345", depth: 2, key: "zip" },
      { type: "END_OBJECT", depth: 1 },
      { type: "END_OBJECT", depth: 0 },
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
      for (let char of jsonString) {
        parser.processChar(char);
      }
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
      for (let char of jsonString) {
        parser.processChar(char);
      }
      parser.end();
    }).not.toThrowError();
  });
});
