import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import QuestionMathJax from "./MathJax Files/QuestionMathJax";
import styles from "./Solutions.module.css";
import LatexRenderer from "./MathJax Files/SolutionMathjax";
import { MathJax, MathJaxContext } from "better-react-mathjax";
import { sampleSolutions } from "./SampleSolutions";

const Solutions = () => {
  const location = useLocation();
  const user_ass_id = location.state?.user_ass_id;
  const [solutionData, setSolutionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSolution, setShowSolution] = useState({});
  const [assessmentName, setAssessmentName] = useState("");
  //Sections
  const [sections, setSections] = useState([]);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  // Fetch solution data from API
  const getSolutionData = useCallback(async () => {
    try {
      const response = await axios.get(
       "API"
      );
      const ResponseData = response.data;
      // console.log("Response Data", response.data);
      setSolutionData(ResponseData || []);

      setAssessmentName(ResponseData.assessment_name);

      const sectionsData = ResponseData.sub_division_details.map((section) => ({
        id: section.sub_div_id,
        name: section.sub_div_name,

        questions: section.solution_data.map((question) => ({
          id: question.question_id,
          que: question.question_latex,
          que_diag: question.question_diagrams_url.filter(
            (url) => url.length > 0
          ),
          options: [
            question.option1_latex,
            question.option2_latex,
            question.option3_latex,
            question.option4_latex,
          ],
          options_diag: [
            question.option1_img,
            question.option2_img,
            question.option3_img,
            question.option4_img,
          ],
          user_answer: question.user_answer,
          answer_remark: question.answer_remark,
          correct_option: question.correct_option,
          answer_description: question.answer_description,
          marks: question.marks,
          attempt_status: question.attempt_status,
        })),
      }));
      setSections(sectionsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching solutions:", error);
    } finally {
      setLoading(false);
    }
  }, [user_ass_id]);

  useEffect(() => {
    if (user_ass_id) getSolutionData();
  }, [user_ass_id, getSolutionData]);

  // useEffect(() => {
  //   // Using sample data instead of API call
  //   const data = sampleSolutions[0]; // Get first assessment
  //   setAssessmentName(data.assessment_name);

  //   // Map sections with proper data structure
  //   const sectionsData = data.Sub_divisions_details.map((section) => ({
  //     id: section.SUB_DIV_ID,
  //     name: section.SUB_DIV_NAME,
  //     questions: section.solutions_data.map(question => ({
  //       id: question.question_id,
  //       que: question.question_latex,
  //       que_diag: question.question_diagrams_url || [],
  //       options: [
  //         question.option1_latex,
  //         question.option2_latex,
  //         question.option3_latex,
  //         question.option4_latex
  //       ].filter(Boolean),
  //       options_diag: [
  //         question.option1_img,
  //         question.option2_img,
  //         question.option3_img,
  //         question.option4_img
  //       ].filter(Boolean),
  //       user_answer: question.USER_ANSWER,
  //       correct_option: question.correct_option,
  //       marks: question.marks,
  //       attempt_status: question.attempt_status,
  //       answer_description: question.answer_description
  //     }))
  //   }));

  //   setSections(sectionsData);
  //   setLoading(false);
  // }, []);

  //  // Improved LaTeX parsing to avoid mishandling
  //   const parseLatexData = (latexString) => {
  //     console.log(latexString);
  //     if (!latexString) return "";

  //     try {
  //       const normalizedDesc = latexString
  //       .replace(/([{,])(\s*)(\w+)\s*:/g, '$1"$3":') // Add quotes to keys
  //       .replace(/'/g, '"') // Convert single quotes to double quotes
  //       // .replace(/\n/g, '\\n') // Ensure newline safety
  //       .replace(/\\/g, '\\\\') // Escape all backslashes for JSON

  //       .replace(/\\n/g, "n")
  //       // .replace(/\n/g, "")

  //       // .replace(/'/g, '"') // Convert single quotes to double quotes
  //       // .replace(/\\n/g, "") // Preserve newline markers for further handling
  //       //  .replace(/\\/g, '\\\\')
  //       //  .replace(/\n/g, "")

  //       console.log("ParseLatex",normalizedDesc);
  //       const jsonArray = JSON.parse(normalizedDesc);

  //       return jsonArray
  //         .filter((item) => item.type === "text" || item.type === "math")
  //         .map((item) => item.text)
  //         .join(" ");
  //     } catch (e) {
  //       console.error("Error parsing LaTeX data:", e.message, latexString);
  //       return "Error rendering solution";
  //     }
  //   };

  const parseLatexData = (latexString) => {
    if (!latexString) return [];

    try {
      // Step 1: Normalize the JSON string
      const normalizedDesc = latexString
        .replace(/\\/g, "\\\\") // Escape all backslashes first
        .replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":') // Add quotes to keys
        .replace(/'/g, '"') // Convert single quotes to double quotes
        .replace(/\n/g, "\\n") // Escape newlines
        .replace(/""/g, '"'); // Fix double-quote artifacts

      // Step 2: Parse the normalized JSON
      const parsedArray = JSON.parse(normalizedDesc);

      // Step 3: Convert to JSX elements
      return parsedArray.map((item, idx) => {
        const content = item.text
          .replace(/\\\\/g, "\\") // Unescape LaTeX backslashes
          .replace(/\\n/g, "\n"); // Restore newlines

        return item.type === "math" ? (
          <MathJax key={idx} inline={!content.includes("\\[")}>
            {content}
          </MathJax>
        ) : (
          <div key={idx}>{content}</div>
        );
      });
    } catch (e) {
      console.error("Parsing error:", e);
      return <div className={styles.error}>Error rendering solution</div>;
    }
  };

  // Toggle solution visibility
  const handleToggleSolution = (index) => {
    setShowSolution((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSectionChange = (index) => {
    setActiveSectionIndex(index);
    setQuestions();
  };

  if (loading) {
    return <div className={styles.loading}>Loading solutions...</div>;
  }

  return (
    <>
      <MathJaxContext
        config={{
          loader: { load: ["[tex]/ams"] },
          tex: {
            packages: { "[+]": ["ams"] },
            inlineMath: [["\\(", "\\)"]],
            displayMath: [["\\[", "\\]"]],
            processEscapes: true,
          },
        }}
      >
        <div className={styles.solutionsContainer}>
          <h2 className={styles.assessmentTitle}>
            {assessmentName.toUpperCase()}
          </h2>

          {/* Section Navigation */}
          <div className={styles.sectionNavbar}>
            {sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => setActiveSectionIndex(index)}
                className={`${styles.sectionButton} 
              ${index === activeSectionIndex ? styles.activeSection : ""}`}
              >
                {section.name}
              </button>
            ))}
          </div>

          {/*Questions for Active Section */}
          {/* {solutionData.map((question, index) => (
            <div key={index} className={styles.questionCard}>
              <div className={styles.questionSection}>
                <h3>Question {index + 1}</h3>
                <div className={styles.questionText}>
                  <QuestionMathJax content={question.question_latex} />
                </div>
              </div> */}

          {sections[activeSectionIndex]?.questions.map((question, index) => (
            <div key={question.id} className={styles.questionCard}>
              {/* <div className={styles.questionSection}>
            <h3>Question {index + 1}</h3>
            <div className={styles.questionText}>
              <QuestionMathJax content={question.que} />
            </div>
          </div> */}
              <div className={styles.questionSection}>
                <h3>Question {index + 1}</h3>
                <div className={styles.questionText}>
                  <QuestionMathJax content={question.que} />
                </div>
                {/* Show diagrams if available */}
                {question.que_diag && question.que_diag.length > 0 && (
                  <div className={styles.questionDiagrams}>
                    {question.que_diag.map((url, idx) => (
                      <img
                        key={idx}
                        src={`${
                          import.meta.env.VITE_API_URL
                        }/v1/cil/images/${url}`}
                        alt={`Diagram ${idx + 1}`}
                        className={styles.diagramImg}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Options Section */}
              {/* <div className={styles.optionsSection}>
                {["A", "B", "C", "D"].map((option, idx) => (
                  <div
                    key={option}
                    className={
                      `${styles.option} ` +
                      `${
                        !question.user_answer && question.correct_option === option
                          ? styles.correct
                          : ""
                      } ` +
                      `${
                        question.user_answer === option &&
                        question.correct_option === option
                          ? styles.correct
                          : ""
                      } ` +
                      `${
                        question.user_answer === option &&
                        question.correct_option !== option
                          ? styles.wrong
                          : ""
                      }`
                    }
                  >
                    <span>{option}.</span>
                    <QuestionMathJax content={question[`option${idx + 1}_latex`]} />
                  </div>
                ))}
              </div> */}

              {/* Options */}
              <div className={styles.optionsSection}>
                {question.options.map((optionText, idx) => (
                  <div
                    key={idx}
                    className={`${styles.option} ${
                      question.user_answer === String.fromCharCode(65 + idx)
                        ? question.user_answer === question.correct_option
                          ? styles.correct
                          : styles.wrong
                        : question.correct_option ===
                          String.fromCharCode(65 + idx)
                        ? styles.correct
                        : ""
                    }`}
                  >
                    <span>{String.fromCharCode(65 + idx)}.</span>
                    <QuestionMathJax content={optionText} />
                  </div>
                ))}
              </div>

              {/* Answer Status */}
              <div className={styles.answerStatus}>
                <p>
                  Your Answer:{" "}
                  <span
                    className={
                        question.answer_remark?.trim().toUpperCase() === "CORRECT"
                        ? styles.right
                        : styles.incorrect
                    }
                  >
                    {/* {console.log("Question object:", question)} */}
                    {/* {console.log("Answer remark raw:", JSON.stringify(question.answer_remark))} */}
                    {question.user_answer || "Not Attempted"}
                  </span>
                </p>
                <p>
                  Correct Answer:{" "}
                  <span className={styles.right}>
                    {question.correct_option}
                  </span>
                </p>
              </div>

              {/* Solution Button */}
              <button
                className={styles.solutionButton}
                onClick={() => handleToggleSolution(question.id)}
              >
                {showSolution[question.id] ? "Hide Solution" : "Show Solution"}
              </button>

              {/* Solution Section */}
              {showSolution[question.id] && (
                <div className={styles.solutionSection}>
                  <h4>Solution:</h4>
                  <div className={styles.solutionText}>
                    <QuestionMathJax content={question.answer_description} />
                    {/* {question.desc_line_by_latex ? (
                      parseLatexData(question.desc_line_by_latex)
                    ) : (
                      <p>No solution available</p>
                    )} */}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </MathJaxContext>
    </>
  );
};

export default Solutions;
