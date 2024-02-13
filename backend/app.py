from functools import wraps
from bson import ObjectId
from flask import Flask, request, jsonify
import matplotlib.pyplot as plt
import matplotlib
import pymongo
import bcrypt
import jwt
import os
from datetime import datetime, timedelta
from flask_cors import CORS
import pandas as pd
import uuid

matplotlib.use("Agg")

app = Flask(__name__)
CORS(app)

mongo = pymongo.MongoClient(os.environ["MONGO_HOST"])

app.config["SECRET_KEY"] = "your_secret_key"
investors = mongo["user_db"].investors
startups = mongo["user_db"].startups

INVESTORS = "investor"
STARTUPS = "startup"


def token_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization")

        if not token:
            return jsonify({"message": "Token is missing"}), 401

        try:
            data = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
            user_type = data["type"]
            if user_type == INVESTORS:
                current_user = investors.find_one({"_id": ObjectId(data["user_id"])})
            elif user_type == STARTUPS:
                current_user = startups.find_one({"_id": ObjectId(data["user_id"])})
            else:
                return jsonify({"message": "User type is not valid"}), 400
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Token is invalid"}), 401

        return f(current_user, user_type, *args, **kwargs)

    return wrapper


@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()

    if "email" not in data or "password" not in data:
        return jsonify({"message": "Email and password are required"}), 400

    if data["user_type"] == INVESTORS:
        if investors.find_one({"email": data["email"]}):
            return jsonify({"message": "Email already exists"}), 400

        hashed_password = bcrypt.hashpw(
            data["password"].encode("utf-8"), bcrypt.gensalt()
        )

        user_id = investors.insert_one(
            {
                "email": data["email"],
                "password": hashed_password,
            }
        ).inserted_id

        return (
            jsonify({"message": "User created successfully", "user_id": str(user_id)}),
            201,
        )
    elif data["user_type"] == STARTUPS:
        if startups.find_one({"email": data["email"]}):
            return jsonify({"message": "Email already exists"}), 400

        hashed_password = bcrypt.hashpw(
            data["password"].encode("utf-8"), bcrypt.gensalt()
        )

        user_id = startups.insert_one(
            {
                "email": data["email"],
                "password": hashed_password,
                "companyName": data["companyName"],
                "businessDescription": data["businessDescription"],
                "revenue": data["revenue"],
                "investors": [],
            }
        ).inserted_id

        return (
            jsonify({"message": "User created successfully", "user_id": str(user_id)}),
            201,
        )
    else:
        return jsonify({"message": "User type is not valid"}), 400


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if "email" not in data or "password" not in data:
        return jsonify({"message": "Email and password are required"}), 400

    if data["user_type"] == INVESTORS:
        user = investors.find_one({"email": data["email"]})
    elif data["user_type"] == STARTUPS:
        user = startups.find_one({"email": data["email"]})
    else:
        return jsonify({"message": "User type is not valid"}), 400

    if user and bcrypt.checkpw(data["password"].encode("utf-8"), user["password"]):
        token = jwt.encode(
            {
                "user_id": str(user["_id"]),
                "exp": datetime.utcnow() + timedelta(days=1),
                "type": data["user_type"],
            },
            app.config["SECRET_KEY"],
            algorithm="HS256",
        )
        return (
            jsonify({"message": "Login successful", "token": token}),
            200,
        )
    else:
        return jsonify({"message": "Invalid email or password"}), 401


@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return "No file part", 400
    file = request.files["file"]

    if file.filename == "":
        return "No selected file", 400
    start_date = pd.to_datetime(
        request.form["startDate"], format="%a, %d %b %Y %H:%M:%S GMT"
    )
    end_date = pd.to_datetime(
        request.form["endDate"], format="%a, %d %b %Y %H:%M:%S GMT"
    )
    if file:
        df = pd.read_csv(file)
        df["Order Date"] = pd.to_datetime(df["Order Date"], format="%m/%d/%Y")
        df = df[(df["Order Date"] >= start_date) & (df["Order Date"] <= end_date)]
        df["YearMonth"] = df["Order Date"].dt.to_period("M")
        monthly_sales = df.groupby("YearMonth")["Sales"].sum().reset_index()
        monthly_sales["YearMonth"] = monthly_sales["YearMonth"].astype(
            str
        )  # Convert to string for JSON serialization
        return generate_bar_chart(monthly_sales), 200


@app.route("/company/list", methods=["GET"])
@token_required
def get_company_list(current_user, user_type):
    if user_type != INVESTORS:
        return jsonify({"message": "User type is not valid"}), 400

    company_list = startups.find(
        {},
        {
            "email": 0,
            "password": 0,
        },
    )
    return (
        jsonify(
            [
                {
                    "id": str(company["_id"]),
                    "name": company["companyName"],
                    "description": company["businessDescription"],
                    "revenue": company["revenue"],
                }
                for company in company_list
            ]
        ),
        200,
    )


@app.route("/investor/interested", methods=["POST"])
@token_required
def interested_investor(current_user, user_type):
    if user_type != INVESTORS:
        return jsonify({"message": "User type is not valid"}), 400
    data = request.get_json()
    if "startup_id" not in data:
        return jsonify({"message": "Startup id is required"}), 400
    startup_id = data["startup_id"]
    startups.update_one(
        {"_id": ObjectId(startup_id)},
        {"$addToSet": {"investors": current_user["email"]}},
    )
    return jsonify({"message": "Investor interested successfully"}), 200


@app.route("/startup/investors", methods=["GET"])
@token_required
def get_interested_investors(current_user, user_type):
    if user_type != STARTUPS:
        return jsonify({"message": "User type is not valid"}), 400
    return jsonify({"investors": current_user["investors"]}), 200


def generate_bar_chart(data):
    print(data.head())
    plt.figure(figsize=(13, 6))
    plt.bar(data["YearMonth"], data["Sales"])
    plt.xticks(rotation=70)
    plt.xlabel("YearMonth")
    plt.ylabel("Sales")
    plt.title("Sales Chart")

    uuid_str = str(uuid.uuid4())
    plt.savefig(f"static/{uuid_str}.png")
    return uuid_str


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
