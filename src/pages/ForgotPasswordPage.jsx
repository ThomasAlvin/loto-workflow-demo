import {
  Button,
  Center,
  Flex,
  Icon,
  Input,
  InputGroup,
  useToast,
  InputLeftAddon,
} from "@chakra-ui/react";
import { IoIosLock } from "react-icons/io";
import { FaAngleLeft } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import SwalErrorMessages from "../components/SwalErrorMessages";
import moment from "moment";

export default function ForgotPasswordPage() {
  const themeSelector = useSelector((state) => state.login.theme);
  const toast = useToast();
  const [input, setInput] = useState({
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const initialCooldownTime = 30;
  const [cooldownTime, setCooldownTime] = useState(initialCooldownTime);
  const [isCooldown, setIsCooldown] = useState(false);
  useEffect(() => {
    const lastClickedTime = localStorage.getItem("lastClickedTime");
    if (lastClickedTime) {
      const elapsed = Math.floor(
        (Date.now() - parseInt(lastClickedTime, 10)) / 1000,
      );
      const remainingTime = initialCooldownTime - elapsed;
      if (remainingTime && remainingTime > 0) {
        setCooldownTime(remainingTime);
        setIsCooldown(true);
      }
    }
  }, []);
  const formatCooldownTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secondsLeft).padStart(
      2,
      "0",
    )}`;
  };

  const sendResetEmail = async () => {
    try {
      setLoading(true);

      await api
        .post(`user/forgot-password`, input)
        .then((response) => {
          toast({
            title: response.data.message,
            description: "Please check you're email address.",
            status: "success",
            duration: 5000,
            position: "top",
            isClosable: true,
          });
          const initialCooldownTime = Math.floor(
            (response.data.cooldown_until - Date.now()) / 1000,
          );
          setIsCooldown(true);
          if (initialCooldownTime) {
            setCooldownTime(initialCooldownTime);
          }
          localStorage.setItem("lastClickedTime", Date.now().toString());
        })
        .catch((error) => {
          toast({
            title: error.response.data.message,
            description: "Something went wrong.",
            status: "error",
            duration: 5000,
            position: "top",
            isClosable: true,
          });
          console.log(error);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.error("Error sending password reset email:", error.message);
    }
  };

  async function sendEmail() {
    setLoading(true);
    try {
      if (!isCooldown) {
        const formData = new FormData();
        formData.append("email", input.email);
        await api
          .post("/admin/token-recover-password", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((response) => {
            Swal.fire({
              title: "Email Sent",
              text: response.data.message,
              icon: "success",
              customClass: {
                popup:
                  themeSelector?.theme === "light"
                    ? "swal2-custom-popup"
                    : "swal2-custom-popup-dark",
                title: "swal2-custom-title",
                content: "swal2-custom-content",
                actions: "swal2-custom-actions",
                confirmButton: "swal2-custom-confirm-button",
              },
            });
            setLoading(false);
          });
        setIsCooldown(true);
        setCooldownTime(initialCooldownTime);
        localStorage.setItem("lastClickedTime", Date.now().toString());
      }
    } catch (errors) {
      Swal.fire({
        title: "Oops...",
        icon: "error",
        html: SwalErrorMessages(error.response.data.message),
        customClass: {
          popup:
            themeSelector?.theme === "light"
              ? "swal2-custom-popup"
              : "swal2-custom-popup-dark",
          title: "swal2-custom-title",
          content: "swal2-custom-content",
          actions: "swal2-custom-actions",
          confirmButton: "swal2-custom-confirm-button",
        },
      });
      setLoading(false);
    }
  }

  const nav = useNavigate();
  function inputHandler(event) {
    const { value, id } = event.target;
    const tempobject = { ...input };
    tempobject[id] = value;
    setInput(tempobject);
  }
  useEffect(() => {
    let timer;

    if (isCooldown) {
      // Start the countdown
      timer = setInterval(() => {
        setCooldownTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setIsCooldown(false); // End cooldown
            localStorage.removeItem("lastClickedTime");
            return initialCooldownTime; // Reset cooldown time
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, [isCooldown]);
  return (
    <>
      <Center flexDir={"column"} gap={"20px"} w={"100%"} h={"100vh"}>
        <Center flexDir={"column"} gap={"80px"}>
          <Center flexDir={"column"}>
            <Center gap={"12px"} flexDir={"column"}>
              <Center
                className={"loginpage-container"}
                flexDir={"column"}
                py={"40px"}
                px={"20px"}
                border={"1px solid #dbdbdb"}
                gap={"20px"}
              >
                <Center>
                  <Icon fontSize={"64px"} color={"black"} as={IoIosLock}></Icon>
                </Center>
                <Center fontSize={"28px"} fontWeight={"700"} color={"#dc143c"}>
                  Forgot Password?
                </Center>
                <Center
                  textAlign={"center"}
                  fontSize={"14px"}
                  color={"#848484"}
                >
                  No worries! Enter your email address below, and we'll send you
                  instructions to reset your password.
                </Center>
                <Center flexDir={"column"} className="loginpage-inputs">
                  <InputGroup>
                    <InputLeftAddon px={"12px"}>
                      <Icon as={MdEmail}></Icon>
                    </InputLeftAddon>
                    <Input
                      fontSize={"12px"}
                      bgColor={"#fafafa"}
                      placeholder="Email"
                      pl={"15px"}
                      onChange={inputHandler}
                      id="email"
                      type={"email"}
                      w={"300px"}
                    ></Input>
                  </InputGroup>
                  {isCooldown ? (
                    <Button
                      isDisabled={true}
                      color={"white"}
                      borderRadius={"10px"}
                      id="submit"
                      w={"100%"}
                      bgColor={"#dc143c"}
                    >
                      {formatCooldownTime(cooldownTime)}
                    </Button>
                  ) : (
                    <Button
                      isLoading={loading}
                      loadingText="Sending"
                      color={"white"}
                      borderRadius={"10px"}
                      id="submit"
                      w={"100%"}
                      bgColor={"#dc143c"}
                      onClick={sendResetEmail}
                    >
                      Send Email
                    </Button>
                  )}

                  <Center
                    onClick={() => nav("/login")}
                    _hover={{ color: "#dc143c" }}
                    color={"#848484"}
                    cursor={"pointer"}
                    gap={"5px"}
                  >
                    <Flex>
                      <Icon fontSize={"20px"} as={FaAngleLeft}></Icon>
                    </Flex>
                    <Flex fontSize={"14px"}>Back to login</Flex>
                  </Center>
                </Center>
              </Center>
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
