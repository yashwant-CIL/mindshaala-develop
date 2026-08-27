import { MathJax } from "better-react-mathjax";
import React, { useMemo } from "react";

export const QuestionMathJaxConfig = {
  loader: {
    // load: ["[tex]/mhchem", "[tex]/physics", "[tex]/unicode"]
     load: ["[tex]/mhchem", "[tex]/color", "[tex]/physics", "[tex]/unicode"]
  },
  tex: {
    packages: { "[+]": ["ams", "html", "boldsymbol", "mhchem", "physics", "color", "unicode"] },
    inlineMath: [["$", "$"], ["\\(", "\\)"]],
    displayMath: [["$$", "$$"], ["\\[", "\\]"]],
    processEscapes: true,
    processEnvironments: true,
    linebreaks: { automatic: true },
    tags: "none"
  },
  chtml: { linebreaks: { automatic: true }, scale: 1 },
  options: {
    enableMenu: false,
    skipHtmlTags: ["script", "noscript", "style", "textarea", "pre", "code"],
    ignoreHtmlClass: "tex2jax_ignore",
    processHtmlClass: "tex2jax_process"
  }
};

interface Part {
  type: 'text' | 'table' | 'math-block' | 'math-inline' | 'array-block';
  content: string;
}

const findBalancedEnd = (text: string, startIndex: number, startTag: string, endTag: string): number => {
  let depth = 0;
  let index = startIndex;

  while (index < text.length) {
    if (text.startsWith(startTag, index)) {
      depth++;
      index += startTag.length;
    } else if (text.startsWith(endTag, index)) {
      depth--;
      index += endTag.length;
      if (depth === 0) return index;
    } else {
      index++;
    }
  }
  return -1;
};

const normalizeContent = (text: any): string => {
  if (typeof text !== "string") return "";
  let normalized = text;

  normalized = normalized.replace(/(^|[^\\])\\\\([a-zA-Z\[\]\(\)\{\}\,\:\;\!\&\%\$\#\_])/g, "$1\\$2");

  normalized = normalized
    .replace(/\\\s+\[/g, "\\[")
    .replace(/\\\s+\]/g, "\\]");

  return normalized;
};

const parseContent = (text: string): Part[] => {
  if (typeof text !== "string") return [{ type: 'text', content: text }];

  const parts: Part[] = [];
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
    ].filter(c => c.index !== -1).sort((a, b: any) => a.index - b.index);

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
      const end = findBalancedEnd(text, nextIndex, "\\begin{tabular}", "\\end{tabular}");
      if (end !== -1) {
        parts.push({ type: 'table', content: text.slice(nextIndex, end) });
        currentIndex = end;
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
      const end = findBalancedEnd(text, nextIndex, "\\begin{array}", "\\end{array}");
      if (end !== -1) {
        parts.push({ type: 'math-block', content: text.slice(nextIndex, end) });
        currentIndex = end;
      } else {
        parts.push({ type: 'text', content: text.slice(currentIndex) });
        break;
      }
    }
  }
  return parts;
};

const parseColumnSpec = (spec: string) => {
  if (!spec) return [];
  const cols: any[] = [];
  let currentBorderLeft = false;

  for (let i = 0; i < spec.length; i++) {
    const char = spec[i];
    if (char === '|') {
      if (cols.length > 0) {
        cols[cols.length - 1].borderRight = true;
      } else {
        currentBorderLeft = true;
      }
    } else if (['l', 'c', 'r'].includes(char)) {
      cols.push({
        align: char === 'c' ? 'center' : char === 'r' ? 'right' : 'left',
        borderLeft: currentBorderLeft,
        borderRight: false
      });
      currentBorderLeft = false;
    }
  }
  return cols;
};

const parseTableContents = (latex: string) => {
  const specMatch = latex.match(/^\\begin\{tabular\}\{(.*?)\}/);
  const colSpec = specMatch ? parseColumnSpec(specMatch[1]) : [];

  let content = latex.replace(/^\\begin\{tabular\}\{.*?\}/, '').replace(/\\end\{tabular\}$/, '');

  const rows: any[] = [];
  let currentRow: any = { cells: [], hasTopBorder: false, hasBottomBorder: false };
  let currentCell = "";
  let depth = 0; 
  let envDepth = 0; 

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (content.startsWith("\\begin{", i)) envDepth++;
    if (content.startsWith("\\end{", i)) envDepth--;
    if (char === '{') depth++;
    if (char === '}') depth--;

    if (char === '&' && depth === 0 && envDepth === 0) {
      currentRow.cells.push(currentCell.trim());
      currentCell = "";
    }
    else if (content.startsWith("\\\\", i) && depth === 0 && envDepth === 0) {
      currentRow.cells.push(currentCell.trim());
      rows.push(currentRow);
      currentRow = { cells: [], hasTopBorder: false, hasBottomBorder: false };
      currentCell = "";
      i++; 

      let lookAheadIndex = i + 1;
      while (lookAheadIndex < content.length && /\s/.test(content[lookAheadIndex])) {
        lookAheadIndex++;
      }

      if (content[lookAheadIndex] === '[') {
        const closeBracket = content.indexOf(']', lookAheadIndex);
        if (closeBracket !== -1) {
          i = closeBracket;
        }
      }
    }
    else if (content.startsWith("\\hline", i) && depth === 0 && envDepth === 0) {
      if (currentRow.cells.length === 0 && currentCell.trim() === "") {
        currentRow.hasTopBorder = true;
      } else {
        currentRow.hasTopBorder = true;
      }
      i += 5;
    }
    else if (content.startsWith("\\cline", i) && depth === 0 && envDepth === 0) {
      const clineMatch = content.slice(i).match(/^\\cline\s*\{\d+-\d+\}/);
      if (clineMatch) {
        i += clineMatch[0].length - 1;
      } else {
        i += 5;
      }
    }
    else {
      currentCell += char;
    }
  }

  if (currentCell.trim() || currentRow.cells.length > 0) {
    currentRow.cells.push(currentCell.trim());
    rows.push(currentRow);
  } else if (currentRow.hasTopBorder && rows.length > 0) {
    rows[rows.length - 1].hasBottomBorder = true;
  }

  return { rows, colSpec };
};

const LatexTable = ({ content }: { content: string }) => {
  const { rows, colSpec } = parseTableContents(content);

  return (
    <div className="overflow-x-auto my-4 max-w-full">
      <table style={{ borderCollapse: "collapse", margin: "10px 0" }}>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx} style={{
              borderTop: row.hasTopBorder ? "1px solid black" : "none",
              borderBottom: row.hasBottomBorder ? "1px solid black" : "none"
            }}>
              {row.cells.map((cell: string, cIdx: number) => {
                const multicolumnMatch = cell.match(/^\\multicolumn\s*\{(\d+)\}\s*\{(.*?)\}\s*\{(.*)\}$/s);
                let cellContent = cell;
                let colSpan = 1;
                let align = colSpec[cIdx]?.align || 'left';
                let borderRight = colSpec[cIdx]?.borderRight;
                let borderLeft = colSpec[cIdx]?.borderLeft;

                if (multicolumnMatch) {
                  colSpan = parseInt(multicolumnMatch[1], 10);
                  const multiSpec = parseColumnSpec(multicolumnMatch[2]);
                  if (multiSpec.length > 0) {
                    align = multiSpec[0].align;
                    borderRight = multiSpec[0].borderRight; 
                    borderLeft = multiSpec[0].borderLeft;
                  }
                  cellContent = multicolumnMatch[3];
                }

                return (
                  <td
                    key={cIdx}
                    colSpan={colSpan}
                    style={{
                      padding: "4px 8px",
                      verticalAlign: "top",
                      textAlign: align as any,
                      borderLeft: borderLeft ? "1px solid black" : "none",
                      borderRight: borderRight ? "1px solid black" : "none"
                    }}
                  >
                    <QuestionMathJax content={cellContent} />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export interface QuestionMathJaxProps {
    content?: string | any;
    skipInternalLoading?: boolean;
}

export const QuestionMathJax = React.memo(({ content }: QuestionMathJaxProps) => {
  const parts = useMemo(() => {
    if (!content) return [];
    const rawContent = typeof content === "string" ? content : JSON.stringify(content);
    const normalizedContent = normalizeContent(rawContent);
    return parseContent(normalizedContent);
  }, [content]);

  if (!content) return null;

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === 'table') {
          return <LatexTable key={index} content={part.content} />;
        } else if (part.type === 'math-block') {
          let mathContent = part.content;

          // Clean up delimiters to wrap cleanly in $$
          mathContent = mathContent
            .replace(/^\\\[/, "")
            .replace(/\\\]$/, "")
            .replace(/^\$\$/, "")
            .replace(/\$\$$/, "");

          mathContent = mathContent
            .replace(/\\\\n/g, " ")
            .replace(/\\n/g, " ")
            .replace(/\n/g, " ")
            .replace(/\\text\s+\{/g, "\\text{");

          return <MathJax key={index} dynamic>{`$$${mathContent}$$`}</MathJax>;
        } else if (part.type === 'math-inline') {
          let mathContent = part.content;
          
          // User's original math-inline cleanup logic
          mathContent = mathContent
            .replace(/\\\\n/g, " ")
            .replace(/\\n/g, " ")
            .replace(/\n/g, " ")
            .replace(/\\text\s+\{/g, "\\text{");

          return <MathJax key={index} inline dynamic>{mathContent}</MathJax>;
        } else {
          // Text block: Let's split by newlines as user did
          const lines = part.content.split(/(?:\\n|\r\n|\n)/g);
          return (
            <MathJax key={index} inline dynamic>
              {lines.map((line, lIdx) => (
                <React.Fragment key={lIdx}>
                  {line}
                  {lIdx < lines.length - 1 && <br />}
                </React.Fragment>
              ))}
            </MathJax>
          );
        }
      })}
    </>
  );
});

QuestionMathJax.displayName = "QuestionMathJax";

// Keep a simple export for any legacy imports that assumed it existed, just proxying
export const latexToText = (text: string) => text;

export default QuestionMathJax;
