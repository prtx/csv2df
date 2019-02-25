import os
import json
from urllib.parse import urlencode

from flask import Flask, jsonify, request, redirect
from werkzeug import secure_filename
import pandas as pd


UPLOAD_FOLDER = 'uploads'

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route('/uploader', methods = ['POST'])
def upload_file():
    if not request.method == 'POST':
        return "Invalid request method.", 400

    f = request.files.get("csv")
    if not f:
        return "File not provided.", 400
    
    filename, ext = os.path.splitext(f.filename)
    print(ext)
    if ext != ".csv":
        return "Invalid file type.", 400

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(f.filename))
    f.save(file_path)
    return redirect("/get/{}?{}".format(filename, request.query_string.decode("utf8")))


@app.route("/get/<filename>", methods=["GET"])
def get_data(filename):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename("{}.csv".format(filename)))

    delimiter = request.args.get("delimiter", ",")
    try:
        df = pd.read_csv(file_path, delimiter=delimiter)
    except pd.errors.ParserError:
        return "Invalid delimeter.", 400

    headers = request.args.get("headers")
    if headers:
        headers = headers.split(",")

    for h in headers:
        if h not in df.columns:
            return "Invalid header \"{}\".".format(h), 400
    df = df[headers]

    data = json.loads(df.to_json(orient='records'))
    return jsonify(data), 200


if __name__ == "__main__":
    app.run(debug=True)
