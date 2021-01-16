import fc from "fast-check";
import * as z from "zod";
import { zodInputArbitrary } from "../src/zod-fast-check";

describe("Generate arbitaries for Zod schema input type", () => {
  enum Biscuits {
    Digestive,
    CustardCream,
    RichTea,
  }

  enum Cakes {
    CarrotCake = "CARROT_CAKE",
    ChocolateCake = "CHOCOLATE_CAKE",
    VictoriaSponge = "VICTORIA_SPONGE",
  }

  const schemas = {
    string: z.string(),
    number: z.number(),
    bigint: z.bigint(),
    boolean: z.boolean(),
    date: z.date(),
    undefined: z.undefined(),
    null: z.null(),
    "array of numbers": z.array(z.number()),
    "array of string": z.array(z.string()),
    "array of arrays of booleans": z.array(z.array(z.boolean())),
    "nonempty array": z.array(z.number()).nonempty(),
    "empty object": z.object({}),
    "simple object": z.object({
      aString: z.string(),
      aBoolean: z.boolean(),
    }),
    "nested object": z.object({
      child: z.object({
        grandchild1: z.null(),
        grandchild2: z.boolean(),
      }),
    }),
    union: z.union([z.boolean(), z.string()]),
    "empty tuple": z.tuple([]),
    "nonempty tuple": z.tuple([z.string(), z.boolean(), z.date()]),
    "nested tuple": z.tuple([z.string(), z.tuple([z.number()])]),
    "record of numbers": z.record(z.number()),
    "record of objects": z.record(z.object({ name: z.string() })),
    "map with string keys": z.map(z.string(), z.number()),
    "map with object keys": z.map(
      z.object({ id: z.number() }),
      z.array(z.boolean())
    ),
    "literal number": z.literal(123.5),
    "literal string": z.literal("hello"),
    "literal boolean": z.literal(false),
    enum: z.enum(["Bear", "Wolf", "Fox"]),
    "native enum with numeric values": z.nativeEnum(Biscuits),
    "native enum with string values": z.nativeEnum(Cakes),
    "const enum": z.nativeEnum({
      Duck: "duck",
      Swan: "swan",
      Goose: 3,
    }),
    any: z.any(),
    unknown: z.unknown(),
    void: z.void(),
    "optional number": z.optional(z.number()),
    "optional boolean": z.optional(z.boolean()),
    "nullable string": z.nullable(z.string()),
    "nullable object": z.nullable(z.object({ age: z.number() })),

    // Schemas which rely on refinements
    "number with minimum": z.number().min(500),
    "number with maximum": z.number().max(500),
    int: z.number().int(),
    positive: z.number().positive(),
    negative: z.number().negative(),
    nonpositive: z.number().nonpositive(),
    nonnegative: z.number().nonnegative(),
    "number with custom refinement": z.number().refine((x) => x % 3 === 0),

    "string with minimum length": z.string().min(24),
    "string with maximum length": z.string().max(24),

    // This test is disabled because it is incredibly slow.
    // This is due to the brute force approach to generating strings
    // of the correct length which is currently used.
    // "string with fixed length": z.string().length(24),
  };

  for (const [name, schema] of Object.entries(schemas)) {
    test(name, () => {
      const arbitrary = zodInputArbitrary<z.infer<typeof schema>>(schema);
      return fc.assert(
        fc.property(arbitrary, (value) => {
          schema.parse(value);
        })
      );
    });
  }
});
