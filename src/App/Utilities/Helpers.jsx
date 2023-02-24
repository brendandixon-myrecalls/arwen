const EMAIL_PATTERNS = [
    new RegExp(/\s*[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}\s*/),
]

const PHONE_PATTERNS = [
    //  xxxxxxxxxx
    // xxx xxxxxxx
    // xxx xxx xxxx
    new RegExp(/^\s*([1-9]\d{2})\s*([1-9]\d{2})\s*(\d{4})\s*$/),

    // xxx.xxx.xxxx
    // xxx-xxx-xxxx
    // xxx.xxx-xxxx
    // xxx-xxx.xxxx
    new RegExp(/^\s*([1-9]\d{2})[\.\-]([1-9]\d{2})[\.\-](\d{4})\s*$/),

    // xxx xxx.xxxx
    // xxxxxx.xxxx
    // xxx xxx-xxxx
    // xxxxxx-xxxx
    new RegExp(/^\s*([1-9]\d{2})\s*([1-9]\d{2})[\.\-](\d{4})\s*$/),

    // xxx.xxx xxxx
    // xxx-xxx xxxx
    // xxx.xxxxxxx
    // xxx-xxxxxxx
    new RegExp(/^\s*([1-9]\d{2})[\.\-]([1-9]\d{2})\s*(\d{4})\s*$/),

    // (xxx)xxx-xxxx
    // (xxx)xxx.xxxx
    // (xxx) xxx-xxxx
    // (xxx) xxx.xxxx
    new RegExp(/^\s*\(([1-9]\d{2})\)\s*([1-9]\d{2})[\.\-](\d{4})\s*$/),

    // (xxx)xxxxxxx
    // (xxx)xxx xxxx
    // (xxx) xxx xxxx
    new RegExp(/^\s*\(([1-9]\d{2})\)\s*([1-9]\d{2})\s*(\d{4})\s*$/),
]

function validateWith(s, patterns) {
    return (s || '').length > 0 && patterns.find(p => s.match(p));
}

export const validateEmail = (s) => validateWith(s, EMAIL_PATTERNS);
export const validatePhone = (s) => validateWith(s, PHONE_PATTERNS);
