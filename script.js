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
let updateUrl = () => {
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
let triggerUpdateUrl = () => {
    clearTimeout(updateUrlTimeout);
    updateUrlTimeout = setTimeout(updateUrl, 2000);
};

latinIn.oninput = (e) => {
    let diacritic = ouTypeMacron.checked
        ? "\u0304"
        : ouTypeBMacra.checked
        ? "\u1DC6"
        : ouTypeVertical.checked
        ? "\u033E"
        : "\u0303";
    let quotations = quoteTypeSquare.checked
        ? ["\uFF62", "\uFF63"]
        : ["\u25D6", "\u25D7"];
    let comma = commaToggle.checked ? "\uFF64" : ","
    likanuOutText.innerText = toLikanu(latinIn.value, diacritic, quotations, comma)
        // Replace newlines with a placeholder character to later update as <br />
        // because this initial step uses innerText for safer DOM modification
        .replace(/\r?\n/g, "\uFFFE");
    likanuOut.innerHTML = likanuOutText.innerHTML.replace(/\uFFFE/g, "<br />");
    triggerUpdateUrl();
};

copyLikanu.onclick = (e) => {
    // Copy the text inside the text field
    navigator.clipboard.writeText(likanuOut.innerText);
    e.target.classList.add("flash");
    setTimeout(() => e.target.classList.remove("flash"), 1000);
};

likanuIn.oninput = (e) => {
    latinOutText.innerText = toLatin(likanuIn.value)
        // Replace newlines with a placeholder character to later update as <br />
        // because this initial step uses innerText for safer DOM modification
        .replace(/\r?\n/g, "\uFFFE");
    // Update actual output through innerHTML and only now update line breaks
    latinOut.innerHTML = latinOutText.innerHTML.replace(/\uFFFE/g, "<br />");
    triggerUpdateUrl();
};

ouTypeVertical.oninput = ouTypeBMacra.oninput = quoteTypeSquare.oninput = quoteTypeButton.oninput = ouTypeTilde.oninput = ouTypeMacron.oninput = commaToggle.oninput = () => {
    latinIn.oninput();
    clearTimeout(updateUrlTimeout);
};

latinIn.onfocus = (e) => e.target.select();
likanuOutText.onfocus = (e) => e.target.select();

copyLatin.onclick = (e) => {
    // Copy the text inside the text field
    navigator.clipboard.writeText(latinOut.innerText);
    e.target.classList.add("flash");
    setTimeout(() => e.target.classList.remove("flash"), 1000);
};

window.onload = (e) => {
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
    clearTimeout(updateUrlTimeout);
};
