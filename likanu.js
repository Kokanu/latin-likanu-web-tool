const lCons = "ptkwljmnshc",
    kCons = "\u006F\u029C\u028C\u0078\u0255\u028B\u0242\u025E\u01A8\u0264\u0275\u025B";
const lVowels = "ieoua",
    kVowels = "\u0131\u0237\u0283\u017F";

    let index = (loc, val) => loc.indexOf(val.toLowerCase());

let toLikanu = (latin, diacritic, quotations, comma) => {
    return latin
    // Pre-process quotation marks, replacing with [ and ] as placeholder quotation marks
        .split('"')
        .reduce((acc, v, i) => acc + (i % 2 ? "[" : "]") + v)
        // Pre-process proper nouns, adding { and } as placeholder transliteration marks
        .replace(/\b[A-Z][A-Za-z]*(?: [A-Z][A-Za-z]*)*/g, "{$&}")
        // Replace abugida characters
        .replace(
            /([ptkwljmnshc])?([aieuo])(n(?![aieuo]))?|([ptkwljmnshc])(?![aieuo])/gi, // RegEx: cons?+vowel+n? | const
            (_, p1, p2, p3, p4) =>
                p4 // If no vowel found
                    ? kCons[index(lCons, p4) + 1] // Null consonant
                    : kCons[p1 ? index(lCons, p1) + 1 : 0] + // Leading consonant
                        (p3 ? diacritic : "") +
                        (kVowels[index(lVowels, p2)] || "")
        )
        // Replace punctuation
        .replace(/,/g, comma)
        .replace(/:/g, "\u2013")
        .replace(/\./g, ":")
        .replace(/\[/g, quotations[0])
        .replace(/]/g, quotations[1])
        .replace(/\?/g, "\u2248")
        .replace(/!/g, "\u02AD")
        .replace(/\{/g, "\u2039")
        .replace(/}/g, "\u203A");
};

let toLatin = (likanu) => {
    return likanu
        // Replace puncutation (aside from transliteration marks)
        .replace(/\uFF64/g, ",")
        .replace(/:/g, ".")
        .replace(/\u2013/g, ":")
        .replace(/\uFF62|\uFF63|\u25D6|\u25D7/g, '"')
        .replace(/\u2248/g, "?")
        .replace(/\u02AD/g, "!")
        // Replace abugida characters
        .replace(
            new RegExp(
                `([${kCons}])(?:(\u0304|\u0303)?([${kVowels}])|(\u0304|\u0303)?)`,
                "g"
            ),
            (_, consonant, diacritic, vowel, loneDiacritic) => {
                const cIndex = kCons.indexOf(consonant);
                const vIndex = kVowels.indexOf(vowel);
                // `${initial consonant}${vowel}${coda n}`
                return `${cIndex !== 0 ? ("a" + lCons)[cIndex] : ""}${
                    lVowels[vIndex] || "a"
                }${diacritic || loneDiacritic ? "n" : ""}`;
            }
        )
        // Capitalize first letter of transliterated words and remove transliteration marks
        .replace(
            /\u2039([a-z ]*)\u203A/g,
            (_, p1) =>
                " " +
                p1
                    .split(" ")
                    .map((w) => (w[0] || "").toUpperCase() + w.substring(1))
                    .join(" ")
        );
}
