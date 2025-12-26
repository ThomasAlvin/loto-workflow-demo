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
import { api } from "../api/api";
import { IoWarning } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FaTriangleExclamation } from "react-icons/fa6";
import moment from "moment";
import checkRoleAuth from "../utils/checkRoleAuth";
import { v4 as uuid } from "uuid";
import { LuCopy } from "react-icons/lu";
import copyToClipboard from "../utils/copyToClipboard";
import getAccessibilityByRole from "../utils/getAccessibilityByRole";

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
    getValues,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: "test@gmail.com", password: "Test@123" },
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

  async function handleLogin() {
    const loginInput = getValues();
    localStorage.setItem("isLoggedIn", true);
    dispatch({ type: "startLoading" });
    // setButtonLoading(true);

    await api
      .login(loginInput)
      .then(async (response) => {
        const userAuthData = response.data.user;
        const isSubscriptionValid =
          userAuthData?.main_work_site?.superadmin?.subscriptions?.status ===
          "active";
        dispatch({
          type: "login",
          payload: {
            ...userAuthData,
            role: checkRoleAuth(userAuthData),
            uuid: uuid(),
            subscription: userAuthData.subscriptions,
            current_work_site: userAuthData.main_work_site,
            permissions: getAccessibilityByRole(
              userAuthData,
              isSubscriptionValid
            ),
            is_subscription_valid: isSubscriptionValid,
          },
        });
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
    setValue(id, value);
  }

  return (
    <>
      <Center flexDir={"column"} gap={"10px"} h={"100vh"} w={"100%"}>
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
                    Welcome Admin!
                  </Center>
                  <Center color={"#848484"} fontSize={"12px"}>
                    Login with email and password
                  </Center>
                </Flex>
                <Center flexDir={"column"} px={"20px"}>
                  <Flex flexDir={"column"} position={"relative"} pb={"20px"}>
                    <Input
                      {...register("email")}
                      fontSize={"12px"}
                      onKeyDown={handleKeyPress}
                      bgColor={"#fafafa"}
                      placeholder={"Email"}
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
                        placeholder={"Password"}
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
                      Forgot Password?{" "}
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
                    Login{" "}
                  </Button>
                </Center>
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
                  If you forgot your password and email, please contact your
                  supervisor{" "}
                </Flex>
              </Center>
              <Center></Center>
            </Center>
          </Center>
        </Center>
        <Center color={"blackAlpha.700"} gap={"20px"}>
          <Flex fontSize={"13px"}>English</Flex>
          <Flex fontSize={"13px"}>
            © {moment().format("YYYY")} Digipas Technologies
          </Flex>
        </Center>
      </Center>
    </>
  );
}
