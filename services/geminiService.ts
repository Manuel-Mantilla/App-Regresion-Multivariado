
import { GoogleGenAI, Type } from "@google/genai";
import { DescriptiveAnalysisResult, RegressionResult } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const cleanJsonString = (str: string): string => {
    // Remove markdown code block fences and trim whitespace
    return str.replace(/^```json\s*|```\s*$/g, '').trim();
};

export async function generateDescriptiveAnalysis(csvString: string): Promise<DescriptiveAnalysisResult> {
    const model = 'gemini-2.5-pro';
    const prompt = `
You are a data analysis expert. Analyze the following dataset provided as a CSV string.

"""
${csvString}
"""

Provide your analysis in a single, valid JSON object. Do not include any text before or after the JSON object. The JSON object must have two top-level keys: "statistics" and "charts".

1.  "statistics": This should be an object. For each NUMERIC column in the dataset, create a key with the column name. The value should be an object containing the following statistical measures: 'count', 'mean', 'std' (standard deviation), 'min', '25%' (1st quartile), '50%' (median), '75%' (3rd quartile), and 'max'.

2.  "charts": This should be an array of objects, where each object represents a recommended chart for visualizing the data.
    - For numeric columns, generate a 'histogram'. The object should have:
      - \`type: "histogram"\`
      - \`title: "Distribution of [Column Name]"\`
      - \`xLabel: "[Column Name]"\`
      - \`yLabel: "Frequency"\`
      - \`data\`: An array of objects, each with a 'range' (string, e.g., "10-20") and 'frequency' (number). Create about 10-15 bins.
    - For categorical columns with 10 or fewer unique values, generate a 'bar' chart. The object should have:
      - \`type: "bar"\`
      - \`title: "Frequency of [Column Name]"\`
      - \`xLabel: "[Column Name]"\`
      - \`yLabel: "Count"\`
      - \`data\`: An array of objects, each with a 'name' (the category) and 'count' (number).
`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        const jsonString = cleanJsonString(response.text);
        return JSON.parse(jsonString) as DescriptiveAnalysisResult;
    } catch (error) {
        console.error("Error calling Gemini API for descriptive analysis:", error);
        throw new Error("Failed to get descriptive analysis from AI.");
    }
}

export async function generateRegressionModel(
    csvString: string,
    dependentVariable: string,
    independentVariables: string[]
): Promise<RegressionResult> {
    const model = 'gemini-2.5-pro';
    const prompt = `
You are a data analysis expert specializing in regression modeling. Given the following dataset as a CSV string, and the specified dependent and independent variables, perform a multivariate linear regression.

Dataset:
"""
${csvString}
"""

Variables:
- Dependent Variable (Y): "${dependentVariable}"
- Independent Variables (X): ${JSON.stringify(independentVariables)}

Provide your analysis in a single, valid JSON object. Do not include any text before or after the JSON object. The JSON object must have three top-level keys: "modelQuality", "coefficients", and "formula".

1.  "modelQuality": An object containing key metrics:
    - \`rSquared\`: R-squared value (number).
    - \`adjustedRSquared\`: Adjusted R-squared value (number).
    - \`fStatistic\`: F-statistic of the model (number).
    - \`p_value_f_statistic\`: The p-value associated with the F-statistic (number).
    - \`summary\`: A brief, one-paragraph text summary explaining the model's performance based on these metrics.

2.  "coefficients": An object where each key is a variable name (including "Intercept") and the value is its corresponding coefficient (number).

3.  "formula": A string representing the final regression equation. Format it as: "${dependentVariable} = [Intercept] + [Coeff1] * ${independentVariables[0]} + [Coeff2] * ${independentVariables[1]} + ...". Use up to 4 decimal places for coefficients.
`;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        const jsonString = cleanJsonString(response.text);
        return JSON.parse(jsonString) as RegressionResult;
    } catch (error) {
        console.error("Error calling Gemini API for regression model:", error);
        throw new Error("Failed to get regression model from AI.");
    }
}
