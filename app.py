from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import io
import openai
import os
import re
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains



@app.route('/generate_synthetic_data', methods=['POST'])
def generate_synthetic_data():
    try:
        # Get the uploaded file and the number of rows
        uploaded_file  = request.files['file']
        num_rows = int(request.form.get('numRows', 10))   # Default to 100 rows if not specified
        custom_prompt = request.form.get('customPrompt', '')  # Get custom prompt if provided

        # Get the filename and extension
        filename = secure_filename(uploaded_file.filename)
        file_extension = os.path.splitext(filename)[1].lower()

        # Read the file into a DataFrame based on the file extension
        if file_extension == '.csv':
            df = pd.read_csv(uploaded_file)
        elif file_extension in ['.xls', '.xlsx']:
            df = pd.read_excel(uploaded_file)
        else:
            return jsonify({'error': 'Unsupported file type. Please upload a CSV or Excel file.'}), 400

        # Analyze the data to create a prompt
        columns = df.columns.tolist()
        dtypes = df.dtypes.astype(str).to_dict()

        # Create a description of the data
        data_description = f"The data has the following columns and data types:\n"
        for col in columns:
            data_description += f"- {col}: {dtypes[col]}\n"

        # Include the custom prompt if provided
        custom_prompt_text = f"\nAdditional instructions: {custom_prompt.strip()}\n" if custom_prompt.strip() else ""

        # Construct a prompt for GPT-4
        prompt = f"""
I have a dataset with the following structure:
{data_description}
Please generate {num_rows} rows of synthetic data that follows the same structure and data types.{custom_prompt_text}
Only provide the data in CSV format, with comma as the delimiter, including the header row. Do not include any explanations or additional text.
"""

        # Call OpenAI GPT-4 API
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a data generator assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2000,
            n=1,
            stop=None,
            temperature=0.7
        )

        # Extract the generated text
        generated_text = response['choices'][0]['message']['content'].strip()

        # Remove any code block markers from the generated text
        generated_text = re.sub(r'^```(?:csv)?\s*', '', generated_text)
        generated_text = re.sub(r'\s*```$', '', generated_text)

        # Convert the extracted CSV text into a DataFrame
        synthetic_df = pd.read_csv(io.StringIO(generated_text))

        # Return the synthetic data as JSON
        return synthetic_df.to_json(orient='records')

    except Exception as e:
        return jsonify({'error': 'An error occurred while generating synthetic data.', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

