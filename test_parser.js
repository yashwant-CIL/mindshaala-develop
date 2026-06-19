const parseContent = (text) => {
  if (typeof text !== "string") return [{ type: 'text', content: text }];

  const parts = [];
  let currentIndex = 0;

  while (currentIndex < text.length) {
    const tableStart = text.indexOf("\\begin{tabular}", currentIndex);
    const mathDisplayStart = text.indexOf("\\[", currentIndex);
    const mathDollarDisplayStart = text.indexOf("$$", currentIndex);
    const mathInlineStart = text.indexOf("\\(", currentIndex);
    const mathDollarInlineStart = text.indexOf("$", currentIndex);
    const arrayStart = text.indexOf("\\begin{array}", currentIndex);

    let nextType = null;
    let nextIndex = -1;

    let candidates = [
      { type: 'table', index: tableStart },
      { type: 'math-display', index: mathDisplayStart },
      { type: 'math-dollar-display', index: mathDollarDisplayStart },
      { type: 'math-inline', index: mathInlineStart },
      { type: 'math-dollar-inline', index: mathDollarInlineStart },
      { type: 'array-block', index: arrayStart }
    ].filter(c => c.index !== -1).sort((a, b) => a.index - b.index);

    if (candidates.length > 0) {
      const dollarInline = candidates.find(c => c.type === 'math-dollar-inline');
      const dollarDisplay = candidates.find(c => c.type === 'math-dollar-display');
      if (dollarInline && dollarDisplay && dollarInline.index === dollarDisplay.index) {
        candidates = candidates.filter(c => c.type !== 'math-dollar-inline');
      }
    }

    if (candidates.length > 0) {
      nextType = candidates[0].type;
      nextIndex = candidates[0].index;
    }

    if (nextIndex === -1) {
      const remaining = text.slice(currentIndex);
      if (remaining) parts.push({ type: 'text', content: remaining });
      break;
    }

    if (nextIndex > currentIndex) {
      parts.push({ type: 'text', content: text.slice(currentIndex, nextIndex) });
    }

    if (nextType === 'table') {
      const end = text.indexOf("\\end{tabular}", nextIndex);
      if (end !== -1) {
        parts.push({ type: 'table', content: text.slice(nextIndex, end+13) });
        currentIndex = end+13;
      } else {
        parts.push({ type: 'text', content: text.slice(currentIndex) });
        break;
      }
    } else if (nextType === 'math-display') {
      const endTag = "\\]";
      const end = text.indexOf(endTag, nextIndex + 2);
      if (end !== -1) {
        const blockEnd = end + endTag.length;
        parts.push({ type: 'math-block', content: text.slice(nextIndex, blockEnd) });
        currentIndex = blockEnd;
      } else {
        parts.push({ type: 'text', content: text.slice(currentIndex) });
        break;
      }
    } else if (nextType === 'math-dollar-display') {
      const endTag = "$$";
      const end = text.indexOf(endTag, nextIndex + 2);
      if (end !== -1) {
        const blockEnd = end + endTag.length;
        parts.push({ type: 'math-block', content: text.slice(nextIndex, blockEnd) });
        currentIndex = blockEnd;
      } else {
        parts.push({ type: 'text', content: text.slice(currentIndex) });
        break;
      }
    } else if (nextType === 'math-inline') {
      const endTag = "\\)";
      const end = text.indexOf(endTag, nextIndex + 2);
      if (end !== -1) {
        const blockEnd = end + endTag.length;
        parts.push({ type: 'math-inline', content: text.slice(nextIndex, blockEnd) });
        currentIndex = blockEnd;
      } else {
        parts.push({ type: 'text', content: text.slice(currentIndex) });
        break;
      }
    } else if (nextType === 'math-dollar-inline') {
      const endTag = "$";
      const end = text.indexOf(endTag, nextIndex + 1);
      if (end !== -1) {
        const blockEnd = end + endTag.length;
        parts.push({ type: 'math-inline', content: text.slice(nextIndex, blockEnd) });
        currentIndex = blockEnd;
      } else {
        parts.push({ type: 'text', content: text.slice(currentIndex) });
        break;
      }
    } else if (nextType === 'array-block') {
      const end = text.indexOf("\\end{array}", nextIndex);
      if (end !== -1) {
        parts.push({ type: 'math-block', content: text.slice(nextIndex, end+11) });
        currentIndex = end+11;
      } else {
        parts.push({ type: 'text', content: text.slice(currentIndex) });
        break;
      }
    }
  }
  return parts;
};

const normalizeContent = (text) => {
  if (typeof text !== "string") return "";
  let normalized = text;

  normalized = normalized.replace(/(^|[^\\])\\\\([a-zA-Z\[\]\(\)\{\}\,\:\;\!\&\%\$\#\_])/g, "$1\\$2");

  normalized = normalized
    .replace(/\\\s+\[/g, "\\[")
    .replace(/\\\s+\]/g, "\\]");

  return normalized;
};


const input1 = "The value of \\( \\int_{0}^{\\infty} \\frac{d x}{\\left(x^{2}+4\\right)\\left(x^{2}+9\\right)} \\) is";
const input2 = "\\( \\frac{\\pi}{60} \\)";

console.log("INPUT 1 (NORMALIZED):");
console.log(JSON.stringify(parseContent(normalizeContent(input1)), null, 2));

console.log("INPUT 2 (NORMALIZED):");
console.log(JSON.stringify(parseContent(normalizeContent(input2)), null, 2));
