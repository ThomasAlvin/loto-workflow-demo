import {
  Button,
  Center,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  useToast,
  Box,
  Link,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useCallback } from "react";
import { onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { api } from "../api/api";
import { Trans } from "@lingui/react";
import { i18n, activateLocale } from "../i18n";
import { I18nProvider } from "@lingui/react";
import { IoWarning } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FaTriangleExclamation } from "react-icons/fa6";
import { getId, getInstallations } from "firebase/installations";
import moment from "moment";

export default function LoginPage() {
  const [seePassword, setSeePassword] = useState(false);
  const [login, setLogin] = useState({
    email: "",
    password: "",
  });
  const submitButtonRef = useRef();
  const dispatch = useDispatch();
  const userSelector = useSelector((state) => state.login.auth);
  const {
    setValue,
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: "", password: "" },
    resolver: yupResolver(
      Yup.object().shape({
        email: Yup.string()
          .email("Invalid email format")
          .required("Email is required"),
        password: Yup.string().required("Password is required"),
      })
    ),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const toast = useToast();
  const [locale, setLocale] = useState(
    localStorage.getItem("locale") || navigator.language.split("-")[0]
  );

  const hasNotificationSupport =
    "serviceWorker" in navigator && "PushManager" in window ? true : false;

  const changeLanguage = (newLocale) => {
    activateLocale(newLocale);
    setLocale(newLocale);
  };

  async function handleLogin() {
    const loginInput = login;

    dispatch({ type: "startLoading" });
    // setButtonLoading(true);

    let installationId = null;

    const installations = getInstallations();
    installationId = await getId(installations);

    await api
      .post(`user/login`, {
        ...loginInput,
        installationId: installationId,
      })
      .then(async (response) => {
        const { customToken, user, token, type_default } = response.data;

        if (token) {
          dispatch({ type: "stopLoading" });
          nav(`/login/verify?token=${token}`);
          return;
        }
        if (!hasNotificationSupport) {
          localStorage.setItem("showNotificationWarning", "true");
        }
        if (customToken) {
          const userCredential = await signInWithCustomToken(auth, customToken);
          const firebaseUser = userCredential.user;
          const refreshedIdToken = await firebaseUser.getIdToken(true); // Force refresh
        }
      })
      .catch((err) => {
        console.log(err);
        toast({
          title: err.response.data.message,
          description:
            "Please try again or contact support if the issue persists.",
          status: "error",
          duration: 5000,
          position: "top",
          isClosable: true,
        });
        console.log(err);
        dispatch({ type: "stopLoading" });
      });
  }
  const handleKeyPress = useCallback((event) => {
    const { id } = event.target;
    if (event.key === "Enter") {
      if (id === "email") {
        setFocus("password");
      } else if (id === "password") {
        submitButtonRef.current?.click();
      }
    }
  }, []);

  const nav = useNavigate();
  function inputHandler(input) {
    const { value, id } = input.target;
    const tempobject = { ...login };
    tempobject[id] = value;
    setLogin(tempobject);
    setValue(id, value);
  }

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (Notification.permission === "default") {
        // Minta izin notifikasi saat user login
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            // console.log("Notification permission granted.");
          } else {
            // console.warn("Notification permission denied.");
          }
        });
      } else if (Notification.permission === "granted") {
        // console.log("Notification permission already granted.");
      } else {
        // console.warn("User has denied notifications.");
      }
    });
  }, []);

  return (
    <>
      <Center flexDir={"column"} gap={"10px"} h={"100vh"} w={"100%"}>
        {!hasNotificationSupport ? (
          <Flex
            w={"100%"}
            position={"fixed"}
            top={"0"}
            py={"4px"}
            bg={"#fff0bd"}
            color={"#ff9b0d"}
            justify={"space-between"}
            pr={"20px"}
            alignItems={"center"}
          >
            <Flex
              w={"100%"}
              justify={"center"}
              alignItems={"center"}
              gap={"3px"}
            >
              <Flex fontSize={"20px"}>
                <IoWarning />
              </Flex>
              <Box as="span" fontWeight={700}>
                Warning :
              </Box>
              &nbsp;Our real time notification system is disabled in some
              browsers such as :&nbsp;
              <Box as="span" fontWeight={700}>
                Safari, Internet Explorer (IE11 and earlier), and older versions
                of Microsoft Edge.
              </Box>
            </Flex>
            {/* <Flex
              borderRadius={"100%"}
              cursor={"pointer"}
              p={"2px"}
              _hover={{ bg: "#ffe075" }}
              fontSize={"20px"}
              onClick={() => {
                setShowNotifWarning("");
                localStorage.removeItem("showNotificationWarning");
              }}
            >
              <IoMdClose />
            </Flex> */}
          </Flex>
        ) : (
          ""
        )}
        <Center flexDir={"column"} gap={"80px"}>
          <Center flexDir={"column"}>
            <Center gap={"12px"} flexDir={"column"}>
              <Center
                py={"30px"}
                className={"loginpage-container"}
                flexDir={"column"}
                border={"1px solid #dbdbdb"}
              >
                <Flex flexDir={"column"} pb={"30px"}>
                  <Center
                    fontSize={"32px"}
                    fontWeight={"700"}
                    color={"#dc143c"}
                  >
                    <Trans id="login.welcome" />
                  </Center>
                  <Center color={"#848484"} fontSize={"12px"}>
                    <Trans id="login.subtitle" />
                  </Center>
                </Flex>
                <Center flexDir={"column"} px={"20px"}>
                  <Flex flexDir={"column"} position={"relative"} pb={"20px"}>
                    <Input
                      {...register("email")}
                      fontSize={"12px"}
                      onKeyDown={handleKeyPress}
                      bgColor={"#fafafa"}
                      placeholder={i18n._("login.emailPlaceholder")}
                      pl={"15px"}
                      onChange={inputHandler}
                      id="email"
                      w={"300px"}
                    ></Input>
                    {errors.email && (
                      <Flex
                        position={"absolute"}
                        left={0}
                        bottom={0}
                        color="crimson"
                        fontSize="14px"
                        gap="5px"
                        alignItems="center"
                      >
                        <FaTriangleExclamation />
                        <Flex>{errors.email.message}</Flex>
                      </Flex>
                    )}
                  </Flex>
                  <Flex flexDir={"column"} position={"relative"} pb={"20px"}>
                    <InputGroup>
                      <Input
                        {...register("password")}
                        w={"300px"}
                        id="password"
                        bgColor={"#fafafa"}
                        onKeyDown={handleKeyPress}
                        onChange={inputHandler}
                        fontSize={"12px"}
                        type={seePassword ? "text" : "password"}
                        placeholder={i18n._("login.passwordPlaceholder")}
                      ></Input>
                      <InputRightElement width={"2.5rem"} h={"100%"}>
                        <IconButton
                          colorScheme="whiteAlpha"
                          color={"grey"}
                          as={
                            seePassword ? AiOutlineEye : AiOutlineEyeInvisible
                          }
                          w={"24px"}
                          h={"24px"}
                          onClick={() => setSeePassword(!seePassword)}
                          cursor={"pointer"}
                        ></IconButton>
                      </InputRightElement>
                    </InputGroup>
                    {errors.password && (
                      <Flex
                        position={"absolute"}
                        left={0}
                        bottom={0}
                        color="crimson"
                        fontSize="14px"
                        gap="5px"
                        alignItems="center"
                      >
                        <FaTriangleExclamation />
                        <Flex>{errors.password.message}</Flex>
                      </Flex>
                    )}
                  </Flex>
                  <Flex
                    pb={"20px"}
                    w={"100%"}
                    justifyContent="right"
                    fontSize={"14px"}
                    color={"#dc143c"}
                    _hover={{ color: "#23527c" }}
                  >
                    <Flex
                      cursor={"pointer"}
                      fontWeight={400}
                      color={"#dc143c"}
                      _hover={{ color: "#b80d2f", textDecor: "underline" }}
                      onClick={() => {
                        nav("/forgot-password");
                      }}
                    >
                      <Trans id="login.forgotPassword" />
                    </Flex>
                  </Flex>
                  <Button
                    ref={submitButtonRef}
                    isLoading={userSelector.login_loading}
                    color={"white"}
                    borderRadius={"10px"}
                    id="submit"
                    w={"100%"}
                    bgColor={"#dc143c"}
                    onClick={handleSubmit(handleLogin)}
                  >
                    <Trans id="login.button" />
                  </Button>
                </Center>
                <Flex pt={"30px"} fontSize={"14px"} color={"#848484"}>
                  <Trans id="login.noAccount" />
                  &nbsp;
                  <Box
                    cursor={"pointer"}
                    fontWeight={400}
                    color={"#dc143c"}
                    as="span"
                    _hover={{ color: "#b80d2f", textDecor: "underline" }}
                    onClick={() => nav("/request-demo")}
                  >
                    <Trans id="login.signUp" />
                  </Box>
                </Flex>
              </Center>
              <Center
                className="loginpage-border"
                height={"60px"}
                flexDir={"column"}
                border={"1px solid #dbdbdb"}
                paddingY={"20px"}
              >
                <Flex
                  color={"blackAlpha.500"}
                  fontSize={"13px"}
                  textAlign={"center"}
                  px={2}
                >
                  <Trans id="login.contactSupervisor" />
                </Flex>
              </Center>
              <Center></Center>
            </Center>
          </Center>
        </Center>
        <Center color={"blackAlpha.700"} gap={"20px"}>
          {/* <Flex fontSize={"13px"}>English</Flex> */}
          <Flex fontSize={"13px"}>
            <I18nProvider i18n={i18n}>
              {locale === "en" ? (
                <Link onClick={() => changeLanguage("jp")}>English</Link>
              ) : (
                <Link onClick={() => changeLanguage("en")}>日本語</Link>
              )}
            </I18nProvider>
          </Flex>
          <Flex fontSize={"13px"}>
            © {moment().format("YYYY")} Digipas Technologies
          </Flex>
        </Center>
      </Center>
    </>
  );
}
