const lCons = "ptkwljmnshc",
    kCons = "\u006F\u029C\u028C\u0078\u0255\u028B\u0242\u025E\u01A8\u0264\u0275\u025B";
const lVowels = "ieoua",
    kVowels = "\u0131\u0237\u0283\u017F";

let quoteTypeSquare = document.getElementById("quoteTypeSquare");
let quoteTypeButton = document.getElementById("quoteTypeButton");
let ouTypeTilde = document.getElementById("ouTypeTilde");
let ouTypeMacron = document.getElementById("ouTypeMacron");
let ouTypeBMacra = document.getElementById("ouTypeBMacra");
let ouTypeVertical = document.getElementById("ouTypeVertical");
let commaToggle = document.getElementById("commaToggle");
let latinIn = document.getElementById("latinIn");
let likanuOutText = document.getElementById("likanuOutText");
let likanuOut = document.getElementById("likanuOut");
let copyLikanu = document.getElementById("copyLikanu");
let likanuIn = document.getElementById("likanuIn");
let latinOutText = document.getElementById("latinOutText");
let latinOut = document.getElementById("latinOut");
let copyLatin = document.getElementById("copyLatin");

const url = new URL(window.location.href);

ouTypeVertical.oninput = ouTypeBMacra.oninput = quoteTypeSquare.oninput = quoteTypeButton.oninput = ouTypeTilde.oninput = ouTypeMacron.oninput = commaToggle.oninput = () => latinIn.oninput();

let index = (loc, val) => loc.indexOf(val.toLowerCase());

let updateUrl = function () {
    url.searchParams.delete("lat");
    if (latinIn.value) {
        url.searchParams.set("lat", latinIn.value);
    }
    url.searchParams.delete("lik");
    if (likanuIn.value) {
        url.searchParams.set("lik", likanuIn.value);
    }
    window.history.replaceState({}, "", url);
};

let updateUrlTimeout = null;
let triggerUpdateUrl = function() {
    if (updateUrlTimeout) {
        clearTimeout(updateUrlTimeout);
    }
    setTimeout(function () {updateUrl(); updateUrlTimeout = null;}, 2000);
};

latinIn.oninput = function (e) {
    let diacritic = ouTypeMacron.checked
        ? "\u0304"
        : ouTypeBMacra.checked
        ? "\u1DC6"
        : ouTypeVertical.checked
        ? "\u033E"
        : "\u0303";
    let quotation = quoteTypeSquare.checked
        ? ["\uFF62", "\uFF63"]
        : ["\u25D6", "\u25D7"];
    likanuOutText.innerText = latinIn.value
        // Pre-process quotation marks, replacing with [ and ] as placeholder quotation marks
        .split('"')
        .reduce((acc, v, i) => acc + (i % 2 ? "[" : "]") + v)
        // Pre-process proper nouns, adding { and } as placeholder transliteration marks
        .replace(/\b[A-Z][A-Za-z]*(?: [A-Z][A-Za-z]*)*/g, "{$&}")
        // Replace abugida characters
        .replace(
            /([jklmnpstwch])?([aeiou])(n(?![aeiou]))?|([jklmnpstwch])(?![aeiou])/gi, // RegEx: cons?+vowel+n? | const
            (_, p1, p2, p3, p4) =>
                p4 // If no vowel found
                    ? kCons[index(lCons, p4) + 1] // Null consonant
                    : kCons[p1 ? index(lCons, p1) + 1 : 0] + // Leading consonant
                        (p3 ? diacritic : "") +
                        (kVowels[index(lVowels, p2)] || "")
        )
        // Replace punctuation
        .replace(/,/g, commaToggle.checked ? "\uFF64" : ",")
        .replace(/:/g, "\u2013")
        .replace(/\./g, ":")
        .replace(/\[/g, quotation[0])
        .replace(/]/g, quotation[1])
        .replace(/\?/g, "\u2248")
        .replace(/!/g, "\u02AD")
        .replace(/\{/g, "\u2039")
        .replace(/}/g, "\u203A")
        // Replace newlines with a placeholder character to later update as <br />
        // because this initial step uses innerText for safer DOM modification
        .replace(/\r?\n/g, "\uFFFE");
    // Update actual output through innerHTML and only now update line breaks
    likanuOut.innerHTML = likanuOutText.innerHTML.replace(/\uFFFE/g, "<br />");
    triggerUpdateUrl();
};

copyLikanu.onclick = (e) => {
    // Copy the text inside the text field
    navigator.clipboard.writeText(likanuOut.innerText);
    e.target.classList.add("flash");
    setTimeout(() => e.target.classList.remove("flash"), 1000);
};

likanuIn.oninput = function (e) {
    latinOutText.innerText = likanuIn.value
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
        )
        // Replace newlines with a placeholder character to later update as <br />
        // because this initial step uses innerText for safer DOM modification
        .replace(/\r?\n/g, "\uFFFE");
    // Update actual output through innerHTML and only now update line breaks
    latinOut.innerHTML = latinOutText.innerHTML.replace(/\uFFFE/g, "\n");
    triggerUpdateUrl();
};

latinIn.onfocus = (e) => e.target.select();
likanuOutText.onfocus = (e) => e.target.select();

likanuIn.onfocus = (e) => e.target.select();
latinOutText.onfocus = (e) => e.target.select();

copyLatin.onclick = (e) => {
    // Copy the text inside the text field
    navigator.clipboard.writeText(latinOut.innerText);
    e.target.classList.add("flash");
    setTimeout(() => e.target.classList.remove("flash"), 1000);
};

if (url.searchParams.has("lat")) {
    latinIn.textContent = url.searchParams.get("lat");
} else {
    latinIn.textContent = `a an i in e en u un o on
pa pan pi pin pe pen pu pun po pon
ta tan ti tin te ten tu tun to ton
ka kan ki kin ke ken ku kun ko kon
wa wan wi win we wen wu wun wo won
la lan li lin le len lu lun lo lon
ja jan ji jin je jen ju jun jo jon
ma man mi min me men mu mun mo mon
na nan ni nin ne nen nu nun no non
sa san si sin se sen su sun so son
ha han hi hin he hen hu hun ho hon
ca can ci cin ce cen cu cun co con
" " { } , . : ? !`;
}
if (url.searchParams.has("lik")) {
    likanuIn.textContent = url.searchParams.get("lik");
}
latinIn.oninput();
likanuIn.oninput();
