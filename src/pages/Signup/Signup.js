import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import {
  FaUserAlt,
  FaLock,
  FaCheckDouble,
  FaAt,
  FaGoogle,
} from "react-icons/fa";
import * as Yup from "yup";
import axios from "axios";

import { loginTranslations } from "../Login/loginTranslations";
import { signupTranslations } from "./signupTranslations";
import { useLanguageContext } from "../../context/LanguageContext";
import { useScreenSizeContext } from "../../context/ScreenSizeContext";
import { useAuthStateContext } from "../../context/AuthStateContext";

// This is the signup page for this website
// Allows users to create their account locally
// Users must provide an ndhu email address, a unique username, a password and confirm that password
// Users can also choose to navigate from here to the login page

const Signup = () => {
  const { setAuthState, googleSignIn } = useAuthStateContext();
  const { language } = useLanguageContext();
  const { isDesktop } = useScreenSizeContext();
  const navigate = useNavigate();
  const [message, setMessage] = useState({ isError: false, msg: "" });

  const initialValues = {
    username: "",
    email: "",
    password: "",
    confirm: "",
  };

  // This will restrict the input of the username, email, password, and confirm password
  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .min(
        3,
        language === "English"
          ? signupTranslations[9].english
          : language === "Chinese" && signupTranslations[9].chinese
      )
      .max(
        25,
        language === "English"
          ? signupTranslations[10].english
          : language === "Chinese" && signupTranslations[10].chinese
      )
      .required(
        language === "English"
          ? signupTranslations[11].english
          : language === "Chinese" && signupTranslations[11].chinese
      ),

    email: Yup.string()
      .email(
        language === "English"
          ? signupTranslations[12].english
          : language === "Chinese" && signupTranslations[12].chinese
      )
      .test(
        "domain",
        language === "English"
          ? signupTranslations[13].english
          : language === "Chinese" && signupTranslations[13].chinese,
        (value) => {
          if (value?.split("@", 2)[1] === "gms.ndhu.edu.tw") return true;
          return false;
        }
      )
      .required(
        language === "English"
          ? signupTranslations[14].english
          : language === "Chinese" && signupTranslations[14].chinese
      ),

    password: Yup.string()
      .min(
        8,
        language === "English"
          ? signupTranslations[15].english
          : language === "Chinese" && signupTranslations[15].chinese
      )
      .matches(
        /[0-9]/,
        language === "English"
          ? signupTranslations[16].english
          : language === "Chinese" && signupTranslations[16].chinese
      )
      .matches(
        /[a-z]/,
        language === "English"
          ? signupTranslations[17].english
          : language === "Chinese" && signupTranslations[17].chinese
      )
      .matches(
        /[A-Z]/,
        language === "English"
          ? signupTranslations[18].english
          : language === "Chinese" && signupTranslations[18].chinese
      )
      .matches(
        /[^\w]/,
        language === "English"
          ? signupTranslations[19].english
          : language === "Chinese" && signupTranslations[19].chinese
      )
      .required(
        language === "English"
          ? signupTranslations[20].english
          : language === "Chinese" && signupTranslations[20].chinese
      ),

    confirm: Yup.string()
      .oneOf(
        [Yup.ref("password"), null],
        language === "English"
          ? signupTranslations[21].english
          : language === "Chinese" && signupTranslations[21].chinese
      )
      .required(
        language === "English"
          ? signupTranslations[22].english
          : language === "Chinese" && signupTranslations[22].chinese
      ),
  });

  // Sends data to server so user can be created, user will then have to verify their email, as only ndhu students are accepted
  const handleSubmit = (data, actions) => {
    axios
      .post(`${process.env.REACT_APP_URL}users/signup`, data)
      .then((res) => {
        if (res.data.status === "FAILED")
          setMessage({ isError: true, msg: res.data.message });
        if (res.data.status === "SUCCESS") {
          setMessage({ isError: false, msg: res.data.message });
          actions.resetForm();
        }
      })
      .catch((error) => console.log(error));
  };

  // Handles google sign in allowing only for ndhu email domains and then passing data to server to add a user to db
  // Returns an access token that is later used to persist the login and verify the user
  const handleGoogleSignIn = (e) => {
    e.preventDefault();
    setMessage({
      msg:
        language === "English"
          ? loginTranslations[8].english
          : language === "Chinese" && loginTranslations[8].chinese,
      isError: false,
    });
    googleSignIn()
      .then((res) => {
        const { displayName, uid, email, photoURL } = res.user.providerData[0];
        // Check if the email the user choose to authenticate with google is an NDHU email, if not then can't accept
        if (email.split("@", 2)[1] !== "gms.ndhu.edu.tw") {
          setMessage({
            isError: true,
            msg:
              language === "English"
                ? loginTranslations[9].english
                : language === "Chinese" && loginTranslations[9].chinese,
          });
          return;
        }
        // If the email is NDHU email then input the data into database
        axios
          .post(`${process.env.REACT_APP_URL}users/signup-google`, {
            username: displayName,
            email,
            photoUrl: photoURL,
          })
          .then((res) => {
            if (res.data.status === "FAILED")
              setMessage({ msg: res.data.message, isError: true });
            // If success then set the authState to logged in
            if (res.data.status === "SUCCESS") {
              setAuthState({
                username: displayName,
                id: uid,
                loggedIn: true,
              });
            }
          })
          .catch((error) => console.log(error));

        // Now set the accessToken in the localstorage and navigate to home
        res.user
          .getIdToken()
          .then((accessToken) => {
            localStorage.setItem("accessToken", accessToken);
            navigate("/");
          })
          .catch((error) => console.log(error));
      })
      .catch((error) => console.log(error));
  };

  return (
    <section id="signup" className="page">
      <div className="container">
        <article className="create-account">
          <div className="header">
            <h1>
              {language === "English"
                ? signupTranslations[0].english
                : language === "Chinese" && signupTranslations[0].chinese}
            </h1>
          </div>
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validationSchema={validationSchema}
            validateOnBlur={false}
          >
            {({ errors }) => (
              <Form className="form-container">
                <div className="error-container">
                  {message.msg !== "" && (
                    <span
                      className={
                        message.isError === false ? "green" : undefined
                      }
                    >
                      {message.msg}
                    </span>
                  )}
                  {errors && (
                    <span>
                      {errors.username ||
                        errors.password ||
                        errors.email ||
                        errors.confirm}
                    </span>
                  )}
                </div>

                <div className="field-container">
                  <label>
                    <FaUserAlt />
                  </label>
                  <Field
                    autoComplete="off"
                    name="username"
                    placeholder={
                      language === "English"
                        ? signupTranslations[1].english
                        : language === "Chinese" &&
                          signupTranslations[1].chinese
                    }
                    className="input-field"
                  />
                </div>

                <div className="field-container">
                  <label>
                    <FaAt />
                  </label>
                  <Field
                    autoComplete="off"
                    name="email"
                    placeholder={
                      language === "English"
                        ? signupTranslations[2].english
                        : language === "Chinese" &&
                          signupTranslations[2].chinese
                    }
                    className="input-field"
                  />
                </div>

                <div className="field-container">
                  <label>
                    <FaLock />
                  </label>
                  <Field
                    autoComplete="off"
                    type="password"
                    name="password"
                    placeholder={
                      language === "English"
                        ? signupTranslations[3].english
                        : language === "Chinese" &&
                          signupTranslations[3].chinese
                    }
                    className="input-field"
                  />
                </div>

                <div className="field-container">
                  <label>
                    <FaCheckDouble />
                  </label>
                  <Field
                    autoComplete="off"
                    type="password"
                    name="confirm"
                    placeholder={
                      language === "English"
                        ? signupTranslations[4].english
                        : language === "Chinese" &&
                          signupTranslations[4].chinese
                    }
                    className="input-field"
                  />
                </div>
                <button type="submit">
                  {language === "English"
                    ? signupTranslations[5].english
                    : language === "Chinese" && signupTranslations[5].chinese}
                </button>
              </Form>
            )}
          </Formik>
          <div className="or">
            <div></div>
            <p>
              {language === "English"
                ? loginTranslations[4].english
                : language === "Chinese" && loginTranslations[4].chinese}
            </p>
            <div></div>
          </div>
          <button className="googleBtn" onClick={(e) => handleGoogleSignIn(e)}>
            <FaGoogle />
          </button>
        </article>
        <article className="welcome-back">
          <div className="header">
            <h1>
              {language === "English"
                ? signupTranslations[6].english
                : language === "Chinese" && signupTranslations[6].chinese}
            </h1>
          </div>
          {isDesktop && (
            <p>
              {language === "English"
                ? signupTranslations[7].english
                : language === "Chinese" && signupTranslations[7].chinese}
            </p>
          )}
          <button onClick={() => navigate("/login")}>
            {language === "English"
              ? signupTranslations[8].english
              : language === "Chinese" && signupTranslations[8].chinese}
          </button>
        </article>
      </div>
    </section>
  );
};

export default Signup;
