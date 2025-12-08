import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Box,
  Button,
  Center,
  Checkbox,
  Flex,
  Image,
  Input,
  Radio,
  RadioGroup,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { IoCheckmarkSharp, IoInformationCircle } from "react-icons/io5";
import { IoMdLock } from "react-icons/io";
import { ref, uploadBytes } from "firebase/storage";
import { LuNetwork } from "react-icons/lu";
import SubmitWorkOrderStepNavbar from "../components/SubmitStep/SubmitWorkOrderStepNavbar";
import {
  FaArrowLeftLong,
  FaRegBell,
  FaTriangleExclamation,
} from "react-icons/fa6";
import SubmitWorkOrderStepSideMenu from "../components/SubmitStep/SubmitWorkOrderStepSideMenu";
import { TiClipboard } from "react-icons/ti";
import { FaCogs, FaUserAlt } from "react-icons/fa";
import * as Yup from "yup";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLoading } from "../service/LoadingContext";
import { useEffect, useRef, useState } from "react";
import { api } from "../api/api";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import LoadingOverlay from "../components/LoadingOverlay";
import Swal from "sweetalert2";
import SwalErrorMessages from "../components/SwalErrorMessages";
import { get } from "lodash";
import { FiCheckCircle } from "react-icons/fi";
import SubmitWorkOrderStepFormQuestions from "../components/SubmitStep/SubmitWorkOrderStepFormQuestions";
import { storage } from "../firebase/firebase";
import { useSelector } from "react-redux";
import labelizeRole from "../utils/labelizeRole";
import MemberGroupList from "../components/MemberGroupList";
import VerifyMachineUIDModal from "../components/SubmitStep/VerifyMachineUIDModal";
import image404 from "../assets/images/404-page.png";
import { TbLineScan } from "react-icons/tb";
import moment from "moment";
import SubmitQuestionTypeMapper from "../components/SubmitQuestionTypeMapper";
export default function SubmitWorkOrderStepPage() {
  const taskRefs = useRef([]);
  const location = useLocation();
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const userSelector = useSelector((state) => state.login.auth);
  const { UID, stepUID } = useParams();
  const [workOrder, setWorkOrder] = useState("");
  const abortControllerRef = useRef(new AbortController()); // Persistent controller
  const [submitButtonLoading, setSubmitButtonLoading] = useState(false);
  const [
    submitInspectionFormButtonLoading,
    setSubmitInspectionFormButtonLoading,
  ] = useState(false);
  const [verifyMachineButtonLoading, setVerifyMachineButtonLoading] =
    useState(false);
  const { loading, setLoading } = useLoading();
  const [selectedVerifyMachine, setSelectedVerifyMachine] = useState({});
  const [isConditionActive, setIsConditionActive] = useState(true);
  const [fetchingError, setFetchingError] = useState(false);
  const [submitScope, setSubmitScope] = useState(null);
  const [isWOQValid, setIsWOQValid] = useState(false);
  const [isWOCValid, setIsWOCValid] = useState(false);
  const [isWOMValid, setIsWOMValid] = useState(false);

  const [
    openMachineInspectionFormIndexes,
    setOpenMachineInspectionFormIndexes,
  ] = useState([]);

  const [openMachineIndexes, setOpenMachineIndexes] = useState([]);
  const nav = useNavigate();

  const workOrderStepIndex = workOrder?.work_order_step;
  const workOrderStep = workOrder?.work_order_step;
  let formQuestionCounterIndex = -1;
  let stepMachinesCounterIndex = -1;
  const verifyMachineUIDDisclosure = useDisclosure();
  const workOrderFormQuestionsResolver = Yup.array().of(
    Yup.object().shape({
      response: Yup.mixed().when("is_required", {
        is: true,
        then: () =>
          Yup.mixed()
            .test(
              "is-valid-response",
              "Response must not be empty",
              function (value) {
                const { parent } = this; // Access parent and from
                if (parent.question_type === "Checklist") {
                  if (!Array.isArray(value)) {
                    return this.createError({
                      message: "Checklist response must be an array",
                    });
                  }
                  const expectedLength = parent.options?.length ?? 0;

                  if (value.length !== expectedLength) {
                    return this.createError({
                      message: `All checklist items must be filled`,
                    });
                  }
                  if (!value.every((v) => typeof v === "number")) {
                    return this.createError({
                      message: "All checklist options must be selected",
                    });
                  }
                }
                if (typeof value === "string") {
                  return value.trim().length > 0;
                }
                if (typeof value === "number") {
                  return true;
                }

                if (Array.isArray(value)) {
                  return (
                    value.length > 0 &&
                    value.every(
                      (item) =>
                        typeof item === "number" ||
                        (typeof item === "string" && item.trim().length > 0)
                    )
                  );
                }

                if (value instanceof File) {
                  if (!value.type.startsWith("image/")) {
                    return this.createError({
                      message: "Only image files are allowed",
                    });
                  }

                  if (value.size > 2 * 1024 * 1024) {
                    return this.createError({
                      message: "Image size must be 2MB or smaller",
                    });
                  }
                  return true;
                }

                if (
                  Array.isArray(value) &&
                  value.length > 0 &&
                  value.every((file) => file instanceof File)
                ) {
                  return value.every(
                    (file) =>
                      file.size <= 2 * 1024 * 1024 &&
                      file.type.startsWith("image/")
                  );
                }

                return false;
              }
            )

            .required("Response is required"),

        otherwise: () => Yup.mixed().notRequired(), // ✅ Optional if is_required is false
      }),
    })
  );
  const workOrderStepMachinesResolver = Yup.array().of(
    Yup.object().shape({
      isMachineVerified: Yup.boolean().when("isCompleted", {
        is: (completed) => completed === false, // Only validate when NOT completed
        then: (schema) =>
          schema
            .oneOf([true], "Machine must be verified before completing")
            .required("Machine must be verified before completing"),
        otherwise: (schema) => schema.notRequired(), // Skip validation when completed
      }),
      workOrderInspectionQuestions: Yup.array().of(
        Yup.object().shape({
          is_required: Yup.boolean().required(),
          response: Yup.mixed().when("is_required", {
            is: true, // 🔍 when is_required is true
            then: () =>
              Yup.mixed()
                .test(
                  "is-valid-response",
                  "Response must not be empty",
                  function (value) {
                    const { parent, from } = this;

                    const machine = this.from
                      .map((f) => f.value)
                      .find((v) => v && v.workOrderInspectionQuestions);

                    const isCompleted = machine?.isCompleted;

                    if (isCompleted) return true;

                    if (parent.question_type === "Checklist") {
                      if (!Array.isArray(value)) {
                        return this.createError({
                          message: "Checklist response must be an array",
                        });
                      }
                      const expectedLength = parent.options?.length ?? 0;

                      if (value.length !== expectedLength) {
                        return this.createError({
                          message: `All checklist items must be filled`,
                        });
                      }
                      if (!value.every((v) => typeof v === "number")) {
                        return this.createError({
                          message: "All checklist options must be selected",
                        });
                      }
                    }
                    if (typeof value === "string") {
                      return value.trim().length > 0;
                    }
                    if (typeof value === "number") {
                      return true;
                    }

                    if (Array.isArray(value)) {
                      return (
                        value.length > 0 &&
                        value.every(
                          (item) =>
                            typeof item === "number" ||
                            (typeof item === "string" && item.trim().length > 0)
                        )
                      );
                    }
                    if (value instanceof File) {
                      if (!value.type.startsWith("image/")) {
                        return this.createError({
                          message: "Only image files are allowed",
                        });
                      }

                      // 3️⃣ If too big
                      if (value.size > 2 * 1024 * 1024) {
                        return this.createError({
                          message: "Image size must be 2MB or smaller",
                        });
                      }
                      return true;
                    }

                    // ✅ Case 4: Array of Files
                    if (
                      Array.isArray(value) &&
                      value.length > 0 &&
                      value.every((file) => file instanceof File)
                    ) {
                      return value.every(
                        (file) =>
                          file.size <= 2 * 1024 * 1024 &&
                          file.type.startsWith("image/")
                      );
                    }
                    return false;
                  }
                )
                .required("Response is required"),
            otherwise: () => Yup.mixed().notRequired(), // ✅ Optional if is_required is false
          }),
        })
      ),
      isCompleted: Yup.boolean().oneOf(
        [true],
        "Inspection form must be submitted before completing"
      ),
    })
  );
  const workOrderConditionResponseResolver = Yup.string(
    "Response must be a string"
  ).when([], {
    is: () => isConditionActive,
    then: (schema) =>
      schema.required("Please select one of the options to continue"),
    otherwise: (schema) => schema.notRequired(),
  });
  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    getFieldState,
    watch,
    clearErrors,
    setError,
    reset,
    formState,
    trigger,
  } = useForm({
    shouldFocusError: false,
    defaultValues: {
      UID: "",
      workOrderFormQuestions: [],
      workOrderStepMachines: [],
      responseConditional: null,
    },
    resolver: yupResolver(
      Yup.object({
        workOrderFormQuestions: workOrderFormQuestionsResolver,
        workOrderStepMachines: workOrderStepMachinesResolver,
        responseConditional: workOrderConditionResponseResolver,
      })
    ),
    mode: "onTouched",
    reValidateMode: "onChange",
  });
  const watchWorkOrderFormQuestions = useWatch({
    control,
    name: "workOrderFormQuestions",
  });
  const watchWorkOrderStepMachines = useWatch({
    control,
    name: "workOrderStepMachines",
  });
  const watchWorkOrderConditionResponse = useWatch({
    control,
    name: "responseConditional",
  });

  const { errors, touchedFields } = formState;
  async function fetchWorkOrderStepDetails() {
    setLoading(true);
    await api
      .get(`work-order/${UID}/step/${stepUID}`, {
        signal: abortControllerRef.current.signal,
      })
      .then((response) => {
        console.log(response.data);

        const responseWorkOrder = response.data.work_order;
        const workOrderStep = responseWorkOrder?.work_order_step;
        console.log(workOrderStep);
        reset({
          UID: workOrderStep.UID,
          workOrderFormQuestions: workOrderStep?.work_order_form_questions?.map(
            (formQuestions) => ({
              UID: formQuestions.UID,
              question_type: formQuestions.question_type,
              options: formQuestions.options,
              response: "",
              is_required: !!formQuestions.is_required,
            })
          ),
          workOrderStepMachines:
            workOrderStep?.work_order_step_machines?.flatMap((machine) => {
              return machine.selected_inspection_forms.map((inspectionForm) => {
                return {
                  workOrderMachineUID: machine.UID,
                  workOrderInspectionFormUID:
                    inspectionForm.work_order_step_inspection_form?.UID,
                  workOrderInspectionQuestions:
                    inspectionForm.work_order_step_inspection_form.work_order_step_inspection_questions.map(
                      (inspectionQuestion) => ({
                        UID: inspectionQuestion.UID,
                        question_type: inspectionQuestion.question_type,
                        options: inspectionQuestion.options,
                        response: "",
                        is_required: !!inspectionQuestion.is_required,
                      })
                    ),
                  isMachineVerified: workOrderStep.require_verify_machine
                    ? false
                    : true,
                  isCompleted:
                    inspectionForm.work_order_step_inspection_form.status ===
                    "completed"
                      ? true
                      : false,
                };
              });
            }),
          responseConditional: "",
        });
        setOpenMachineInspectionFormIndexes(
          workOrderStep?.work_order_step_machines?.map(
            (machine, machineIndex) => {
              return machine.selected_inspection_forms.map(
                (inspectionForm, inspectionFormIndex) => {
                  return inspectionFormIndex;
                }
              );
            }
          )
        );

        setOpenMachineIndexes(
          workOrderStep?.work_order_step_machines?.map((_, index) => index)
        );
        setIsConditionActive(!!workOrderStep.condition);
        setWorkOrder({
          ...responseWorkOrder,
        });
      })
      .catch((error) => {
        setFetchingError(true);
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }
  async function uploadImage(file, machineDetails) {
    if (!file) return;

    if (machineDetails) {
      const storageRef = ref(
        storage,
        `media/superadmin/${userSelector.main_work_site.superadmin.UID}/workOrder/${UID}/workOrderStep/${stepUID}/response/machines/${machineDetails.machineUID}/inspection-forms/${machineDetails.inspectionFormUID}/image/${file.name}`
      );
      const snapshot = await uploadBytes(storageRef, file);

      return `media/superadmin/${userSelector.main_work_site.superadmin.UID}/workOrder/${UID}/workOrderStep/${stepUID}/response/machines/${machineDetails.machineUID}/inspection-forms/${machineDetails.inspectionFormUID}/image/${file.name}`;
    } else {
      const storageRef = ref(
        storage,
        `media/superadmin/${userSelector.main_work_site.superadmin.UID}/workOrder/${UID}/workOrderStep/${stepUID}/response/image/${file.name}`
      );
      const snapshot = await uploadBytes(storageRef, file);

      return `media/superadmin/${userSelector.main_work_site.superadmin.UID}/workOrder/${UID}/workOrderStep/${stepUID}/response/image/${file.name}`;
    }
  }
  function applyCompletedInspectionForms(response) {
    console.log(response);
    console.log(workOrder);

    if (!response?.completed_inspection_forms) return;

    const machines = getValues().workOrderStepMachines;
    const attempt = workOrder.work_order_step.attempt || 0;
    response.completed_inspection_forms.forEach((inspectionForm) => {
      const index = machines.findIndex(
        (machine) =>
          machine.workOrderInspectionFormUID ===
          inspectionForm.work_order_step_inspection_form_UID
      );

      if (index === -1) return;
      console.log(index);
      setWorkOrder((prev) => {
        console.log(prev);

        return {
          ...prev,
          work_order_step: {
            ...prev.work_order_step,
            work_order_step_machines:
              prev.work_order_step.work_order_step_machines?.map((wosm) => ({
                ...wosm,
                selected_inspection_forms: wosm.selected_inspection_forms?.map(
                  (sif) => {
                    if (
                      sif.work_order_step_inspection_form.UID ===
                      inspectionForm.work_order_step_inspection_form_UID
                    ) {
                      console.log(inspectionForm.submission);
                      console.log({
                        ...sif,
                        work_order_step_inspection_form: {
                          ...sif.work_order_step_inspection_form,
                          work_order_step_inspection_form_submission: [
                            ...sif.work_order_step_inspection_form
                              .work_order_step_inspection_form_submission,
                            inspectionForm.submission, // 👈 This pushes the new item
                          ],
                        },
                      });

                      return {
                        ...sif,
                        work_order_step_inspection_form: {
                          ...sif.work_order_step_inspection_form,

                          // ⭐ Replace-or-Push logic here
                          work_order_step_inspection_form_submission: (() => {
                            const prev =
                              sif.work_order_step_inspection_form
                                .work_order_step_inspection_form_submission;

                            const attempt =
                              workOrder.work_order_step.attempt || 0;

                            const arr = [...prev];

                            // If attempt index exists → replace
                            if (attempt < arr.length) {
                              arr[attempt] = inspectionForm.submission;
                            } else {
                              // If index does NOT exist → push
                              arr.push(inspectionForm.submission);
                            }

                            return arr;
                          })(),
                        },
                      };
                    }
                    return sif; // ⭐ FIX
                  }
                ),
              })),
          },
        };
      });
      setValue(`workOrderStepMachines[${index}].isCompleted`, true, {
        shouldValidate: true,
      });
      setValue(`workOrderStepMachines[${index}].isMachineVerified`, true, {
        shouldValidate: true,
      });
    });
  }

  async function submitWorkOrderStep(closeModalFunction) {
    setSubmitButtonLoading(true);
    try {
      const formDataObject = {
        workOrderStep: {
          UID: getValues("UID"),
          responseConditional: getValues("responseConditional"),
          workOrderFormQuestions: await Promise.all(
            getValues("workOrderFormQuestions").map(async (val) => {
              return {
                ...val,
                response: Array.isArray(val.response)
                  ? val.response
                  : val.response instanceof File
                  ? [await uploadImage(val.response)]
                  : [val.response],
              };
            })
          ),
        },
      };

      const responseForm = await api.post(
        `work-order/submit-step/${workOrder.UID}`,
        formDataObject
      );

      Swal.fire({
        title: "Success!",
        text: responseForm?.data?.message,
        icon: "success",
        customClass: {
          popup: "swal2-custom-popup",
          title: "swal2-custom-title",
          content: "swal2-custom-content",
          actions: "swal2-custom-actions",
          confirmButton: "swal2-custom-confirm-button",
        },
      });

      nav(`/assigned-work-order${location.search}`);
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: "Oops...",
        icon: "error",
        html: SwalErrorMessages(error.response?.data?.message),
        focusConfirm: false,
        customClass: {
          popup: "swal2-custom-popup",
          title: "swal2-custom-title",
          content: "swal2-custom-content",
          actions: "swal2-custom-actions",
          confirmButton: "swal2-custom-confirm-button",
        },
      });
      return null; // Ensure function returns null on error
    } finally {
      if (closeModalFunction) {
        closeModalFunction();
      }
      setSubmitButtonLoading(false);
    }
  }
  async function submitInspectionForm(inspectionFormUID, scope) {
    try {
      setSubmitInspectionFormButtonLoading(true);

      const questions = getValues(scope) || [];

      const fieldNames = questions.flatMap((_, qIndex) => [
        `${scope}[${qIndex}].is_required`,
        `${scope}[${qIndex}].response`,
      ]);

      const valid = await trigger(fieldNames);
      if (!valid) {
        setSubmitScope(scope);
        return;
      }

      const payloadObject = {
        workOrderStepUID: getValues("UID"),
        workOrderStepMachines: await Promise.all(
          getValues("workOrderStepMachines")
            .filter(
              (machine) =>
                machine.workOrderInspectionFormUID === inspectionFormUID
            )
            .map(async (machine) => ({
              ...machine,
              workOrderInspectionQuestions: await Promise.all(
                machine.workOrderInspectionQuestions.map(
                  async (inspectionQuestion) => {
                    return {
                      ...inspectionQuestion,
                      response: Array.isArray(inspectionQuestion.response)
                        ? inspectionQuestion.response
                        : inspectionQuestion.response instanceof File
                        ? [
                            await uploadImage(inspectionQuestion.response, {
                              machineUID: machine.workOrderMachineUID,
                              inspectionFormUID:
                                machine.workOrderInspectionFormUID,
                            }),
                          ]
                        : [inspectionQuestion.response],
                    };
                  }
                )
              ),
            }))
        ),
      };
      console.log(payloadObject);

      const responseMachine = await api.post(
        `work-order/inspection-form/answer/${workOrder.UID}`,
        payloadObject
      );
      console.log(responseMachine);
      Swal.fire({
        title: "Success!",
        text: responseMachine?.data?.message,
        icon: "success",
        customClass: {
          popup: "swal2-custom-popup",
          title: "swal2-custom-title",
          content: "swal2-custom-content",
          actions: "swal2-custom-actions",
          confirmButton: "swal2-custom-confirm-button",
        },
      });
      applyCompletedInspectionForms(responseMachine.data);
    } catch (error) {
      console.log(error);
      Swal.fire({
        title: "Oops...",
        icon: "error",
        html: SwalErrorMessages(error.response?.data?.message),
        focusConfirm: false,
        customClass: {
          popup: "swal2-custom-popup",
          title: "swal2-custom-title",
          content: "swal2-custom-content",
          actions: "swal2-custom-actions",
          confirmButton: "swal2-custom-confirm-button",
        },
      });
      applyCompletedInspectionForms(error.response?.data);

      return null;
    } finally {
      setSubmitInspectionFormButtonLoading(false);
    }
  }
  function openVerifyMachineModal(machine, stepMachinesCounterIndex) {
    setSelectedVerifyMachine({ ...machine.machine, stepMachinesCounterIndex });

    verifyMachineUIDDisclosure.onOpen();
  }

  function getTaskCounter() {
    let taskCounter = 0;
    if (workOrderStep?.form) taskCounter++;
    if (workOrderStep?.machine) taskCounter++;
    if (workOrderStep?.notify) taskCounter++;
    if (workOrderStep?.condition) taskCounter++;

    return taskCounter;
  }
  function findFirstErrorPath(obj, parentPath = "") {
    if (!obj || typeof obj !== "object") return null;

    // Loop the keys in the order they appear
    for (const key of Object.keys(obj)) {
      const child = obj[key];

      // Build the correct path:
      // - If key is a number (array index) → use [index]
      // - If key is a string → use .key
      const isIndex = !isNaN(key);
      const path = parentPath
        ? isIndex
          ? `${parentPath}[${key}]`
          : `${parentPath}.${key}`
        : isIndex
        ? `[${key}]`
        : key;

      // 1️⃣ Direct error
      if (child && child.message) return path;

      // 2️⃣ Array case
      if (Array.isArray(child)) {
        for (let i = 0; i < child.length; i++) {
          const arrayPath = `${path}[${i}]`;
          const found = findFirstErrorPath(child[i], arrayPath);
          if (found) return found;
        }
        continue;
      }

      // 3️⃣ Object case
      if (typeof child === "object") {
        const found = findFirstErrorPath(child, path);
        if (found) return found;
      }
    }

    return null;
  }

  function getScopedErrors(errors, prefix) {
    const parts = prefix.split(".");
    let node = errors;

    for (const part of parts) {
      // prefix may contain array-like 'workOrderStepMachines.0'
      const idxMatch = part.match(/(\w+)\[(\d+)\]/);
      if (idxMatch) {
        const [, key, idx] = idxMatch;
        node = node?.[key]?.[idx];
      } else {
        node = node?.[part];
      }

      if (!node) return null;
    }

    return node;
  }
  useEffect(() => {
    function findClosestToCenter() {
      const centerY = window.innerHeight * (40 / 100);
      let closest = null;
      let minDistance = Infinity;

      taskRefs.current.forEach((el, idx) => {
        if (el) {
          if (el && typeof el.getBoundingClientRect === "function") {
            const rect = el.getBoundingClientRect();
            // ... your distance logic
            const elCenterY = rect.top + rect.height / 2;
            const distance = Math.abs(elCenterY - centerY);
            if (distance < minDistance) {
              minDistance = distance;
              closest = idx;
            }
          }
        }
      });
      if (window.scrollY === 0) {
        closest = 0;
      } else if (
        scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 1
      ) {
        // closest = workOrderFormik.values.workOrderSteps.length - 1; // or any specific index you want
        closest = getTaskCounter(); // or any specific index you want
      }

      setHighlightedIndex(closest);
    }

    findClosestToCenter();

    // Re-run on scroll and resize
    window.addEventListener("scroll", findClosestToCenter);
    window.addEventListener("resize", findClosestToCenter);

    return () => {
      window.removeEventListener("scroll", findClosestToCenter);
      window.removeEventListener("resize", findClosestToCenter);
    };
  }, []);
  useEffect(() => {
    workOrderFormQuestionsResolver
      .isValid(watchWorkOrderFormQuestions)
      .then(setIsWOQValid);
  }, [watchWorkOrderFormQuestions]);
  useEffect(() => {
    workOrderStepMachinesResolver
      .isValid(watchWorkOrderStepMachines)
      .then(setIsWOMValid);
  }, [watchWorkOrderStepMachines]);
  useEffect(() => {
    workOrderConditionResponseResolver
      .isValid(watchWorkOrderConditionResponse)
      .then(setIsWOCValid);
  }, [watchWorkOrderConditionResponse, isConditionActive]);
  useEffect(() => {
    abortControllerRef.current = new AbortController();
    fetchWorkOrderStepDetails();
    return () => {
      abortControllerRef.current.abort(); // Cleanup on unmount
    };
  }, []);
  useEffect(() => {
    if (!errors) return;

    const scopedErrors = submitScope
      ? getScopedErrors(errors, submitScope)
      : errors;

    if (!scopedErrors) return;
    const firstErrorPath = findFirstErrorPath(scopedErrors);
    console.log(submitScope);
    console.log(scopedErrors);
    console.log(firstErrorPath);

    const fullPath = submitScope
      ? `${submitScope}${firstErrorPath}`
      : firstErrorPath;
    console.log(fullPath);

    if (!fullPath) return;

    // Scroll anchor
    const el = document.querySelector(`[name="${fullPath}"]`);
    console.log(el);
    console.log(errors);

    if (el) {
      el.focus({ preventScroll: true });
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [errors, submitScope]);

  function handleBackRedirect() {
    nav(`/assigned-work-order${location.search}`);
  }
  let validStepCount = 0;
  if (isWOMValid && workOrderStep?.machine) validStepCount++;
  if (isWOQValid && workOrderStep?.form) validStepCount++;
  if (workOrderStep?.notify) validStepCount++;
  if (isWOCValid && workOrderStep?.condition) validStepCount++;
  let taskIndexCount = 0;
  return (
    <>
      {!fetchingError ? (
        <>
          <SubmitWorkOrderStepNavbar handleBackRedirect={handleBackRedirect} />
          <Flex w={"100%"} flexDir={"column"}>
            <Flex w={"100%"}>
              <Flex w={"100%"} pb={"100px"} flexDir={"column"}>
                <Flex flexDir={"column"} pt={"10px"} px={"100px"} gap={"20px"}>
                  <Flex flexDir={"column"} gap={"20px"}>
                    <Flex
                      flexDir={"column"}
                      color={"black"}
                      fontWeight={700}
                      fontSize={"24px"}
                    >
                      <Flex
                        onClick={() => {
                          console.log("workOrder", workOrder);
                          console.log("getValues()", getValues());
                          console.log("errors", errors);
                        }}
                        color={"#dc143c"}
                      >
                        Step
                        {" " + workOrder?.step_index}: {workOrderStep?.name}
                      </Flex>
                      <Flex
                        textAlign={"center"}
                        fontSize={"14px"}
                        color={"#848484"}
                      >
                        {workOrder?.name}
                      </Flex>
                    </Flex>
                  </Flex>

                  <Flex gap={"30px"}>
                    <Flex flex={1} gap={"20px"} flexDir={"column"}>
                      <Flex flexDir={"column"} gap={"20px"}>
                        <Flex>
                          <Flex w={"100%"} flexDir={"column"} gap={"20px"}>
                            {workOrderStep?.form ? (
                              <Accordion
                                defaultIndex={[0]}
                                w={"100%"}
                                allowToggle
                              >
                                <AccordionItem
                                  ref={(el) => {
                                    taskRefs.current[taskIndexCount] = el;
                                    taskIndexCount++;
                                  }}
                                  shadow={
                                    // hasError
                                    //   ? "0px 0px 3px rgba(220, 20, 60,1)"
                                    //   :
                                    highlightedIndex === 0
                                      ? "0px 0px 3px rgba(0, 145, 207,1)"
                                      : "0px 0px 3px rgba(50, 50, 93,0.5)"
                                  }
                                >
                                  <AccordionButton
                                    p={0}
                                    _expanded={{
                                      borderBottom: "1px solid #bababa",
                                    }}
                                    bg={isWOQValid ? "#DBF6CB" : "#ECEFF3"}
                                  >
                                    <Flex
                                      w={"100%"}
                                      // borderRadius={"5px"}
                                      py={"8px"}
                                      px={"12px"}
                                      alignItems={"center"}
                                      justifyContent={"space-between"}
                                    >
                                      <Flex
                                        color={
                                          isWOQValid ? "#3D9666" : "#7059ff"
                                        }
                                        fontWeight={700}
                                        gap={"5px"}
                                        alignItems={"center"}
                                      >
                                        <Flex
                                          p={"4px"}
                                          borderRadius={"100px"}
                                          fontSize={"18px"}
                                        >
                                          {<TiClipboard />}
                                        </Flex>
                                        <Flex>Form</Flex>
                                        {isWOQValid ? (
                                          <Flex fontSize={"18px"}>
                                            <IoCheckmarkSharp />
                                          </Flex>
                                        ) : (
                                          ""
                                        )}
                                      </Flex>
                                      <Flex
                                        cursor={"pointer"}
                                        color={
                                          isWOQValid ? "#3D9666" : "#7059ff"
                                        }
                                        gap={"10px"}
                                        alignItems={"center"}
                                      >
                                        {/* <WorkFlowStepBadges val={val} /> */}
                                        <AccordionIcon />
                                      </Flex>
                                    </Flex>
                                  </AccordionButton>
                                  <AccordionPanel
                                    bg={"#f8f9fa"}
                                    // _hover={{ bg: "#f7f9fa" }}
                                    p={"20px"}
                                    transition={"0.2s ease-in-out"}
                                  >
                                    <Flex flexDir={"column"} gap={"20px"}>
                                      {workOrderStep?.description ? (
                                        <Flex flexDir={"column"}>
                                          <Flex fontWeight={700}>
                                            <Flex
                                              alignItems={"center"}
                                              gap={"5px"}
                                            >
                                              Description :
                                            </Flex>
                                          </Flex>
                                          <Flex color={"#848484"}>
                                            {workOrderStep?.description}
                                          </Flex>
                                        </Flex>
                                      ) : (
                                        ""
                                      )}
                                      <Flex flexDir={"column"} gap={"5px"}>
                                        <Flex fontWeight={700}>
                                          Form Questions :
                                        </Flex>
                                        {/* <Flex fontSize={"14px"} color={"#848484"}>
                                      Answered 0 out of{" "}
                                      {
                                        workOrderStep?.work_order_form_questions.filter(
                                          (question) => question.is_required
                                        )?.length
                                      }{" "}
                                      required questions{" "}
                                    </Flex> */}
                                        {workOrderStep?.work_order_form_questions?.map(
                                          (val, index) => {
                                            formQuestionCounterIndex++;
                                            return (
                                              <SubmitWorkOrderStepFormQuestions
                                                formQuestionCounterIndex={
                                                  formQuestionCounterIndex
                                                }
                                                index={index}
                                                val={val}
                                                register={register}
                                                errors={errors}
                                                getValues={getValues}
                                                setValue={setValue}
                                                trigger={trigger}
                                              />
                                            );
                                          }
                                        )}
                                      </Flex>
                                    </Flex>
                                  </AccordionPanel>
                                </AccordionItem>
                              </Accordion>
                            ) : (
                              ""
                            )}

                            {workOrderStep?.notify ? (
                              <Accordion
                                defaultIndex={[0]}
                                w={"100%"}
                                allowToggle
                              >
                                <AccordionItem
                                  ref={(el) => {
                                    taskRefs.current[taskIndexCount] = el;
                                    taskIndexCount++;
                                  }}
                                  shadow={
                                    highlightedIndex === 1
                                      ? "0px 0px 3px rgba(0, 145, 207,1)"
                                      : "0px 0px 3px rgba(50, 50, 93,0.5)"
                                  }
                                >
                                  <AccordionButton
                                    p={0}
                                    _expanded={{
                                      borderBottom: "1px solid #bababa",
                                    }}
                                    bg={"#DBF6CB"}
                                  >
                                    <Flex
                                      w={"100%"}
                                      py={"8px"}
                                      px={"12px"}
                                      alignItems={"center"}
                                      justifyContent={"space-between"}
                                    >
                                      <Flex
                                        color={"#3D9666"}
                                        fontWeight={700}
                                        gap={"5px"}
                                        alignItems={"center"}
                                      >
                                        <Flex
                                          p={"4px"}
                                          borderRadius={"100px"}
                                          fontSize={"18px"}
                                        >
                                          <FaRegBell />
                                        </Flex>
                                        <Flex>Notify</Flex>
                                        <Flex fontSize={"18px"}>
                                          <IoCheckmarkSharp />
                                        </Flex>
                                      </Flex>
                                      <Flex
                                        cursor={"pointer"}
                                        color={"#bababa"}
                                        _hover={{ color: "black" }}
                                        gap={"10px"}
                                        alignItems={"center"}
                                      >
                                        {/* <WorkFlowStepBadges val={val} /> */}
                                        <AccordionIcon />
                                      </Flex>
                                    </Flex>
                                  </AccordionButton>
                                  <AccordionPanel
                                    bg={"#f8f9fa"}
                                    // _hover={{ bg: "#f7f9fa" }}
                                    p={"20px"}
                                    transition={"0.2s ease-in-out"}
                                  >
                                    <Flex flexDir={"column"} gap={"20px"}>
                                      <Flex
                                        fontSize={"14px"}
                                        color={"#848484"}
                                        alignItems={"center"}
                                        gap={"5px"}
                                      >
                                        <Flex fontSize={"16px"}>
                                          <IoInformationCircle />
                                        </Flex>{" "}
                                        Note : This step will automatically
                                        notify the selected member on
                                        submission.
                                      </Flex>
                                      <Flex flexDir={"column"} gap={"5px"}>
                                        <Flex
                                          onClick={() => {
                                            console.log(workOrderStep);
                                          }}
                                          fontWeight={700}
                                        >
                                          Notified Member
                                        </Flex>
                                        <MemberGroupList
                                          memberArray={
                                            workOrderStep.notified_members
                                          }
                                          grayBg={false}
                                        />
                                      </Flex>
                                      <Flex flexDir={"column"} gap={"5px"}>
                                        <Box
                                          fontWeight={700}
                                          as="span"
                                          flex="1"
                                          textAlign="left"
                                        >
                                          Notification Message
                                        </Box>

                                        <Input
                                          bg={"white"}
                                          boxShadow={
                                            "0px 0px 3px rgba(50,50,93,0.5)"
                                          }
                                          _hover={{
                                            background: "none", // Prevent background color change
                                            borderColor: "none", // Prevent border color change
                                          }}
                                          pointerEvents={"none"}
                                          value={
                                            workOrderStep?.notification_message
                                          }
                                        ></Input>
                                      </Flex>
                                    </Flex>
                                  </AccordionPanel>
                                </AccordionItem>
                              </Accordion>
                            ) : (
                              ""
                            )}

                            {workOrderStep?.machine ? (
                              <Accordion
                                defaultIndex={[0]}
                                w={"100%"}
                                allowToggle
                              >
                                <AccordionItem
                                  ref={(el) => {
                                    taskRefs.current[taskIndexCount] = el;
                                    taskIndexCount++;
                                  }}
                                  shadow={
                                    // hasError
                                    //   ? "0px 0px 3px rgba(220, 20, 60,1)"
                                    //   :
                                    highlightedIndex === 2
                                      ? "0px 0px 3px rgba(0, 145, 207,1)"
                                      : "0px 0px 3px rgba(50, 50, 93,0.5)"
                                  }
                                >
                                  <AccordionButton
                                    p={0}
                                    _expanded={{
                                      borderBottom: "1px solid #bababa",
                                    }}
                                    bg={isWOMValid ? "#DBF6CB" : "#EDF2F7"}
                                  >
                                    <Flex
                                      w={"100%"}
                                      // borderRadius={"5px"}
                                      py={"8px"}
                                      px={"12px"}
                                      alignItems={"center"}
                                      justifyContent={"space-between"}
                                    >
                                      <Flex
                                        color={
                                          isWOMValid ? "#3D9666" : "#848484"
                                        }
                                        fontWeight={700}
                                        gap={"5px"}
                                        alignItems={"center"}
                                      >
                                        <Flex
                                          bg={
                                            isWOMValid ? "#DBF6CB" : "#EDF2F7"
                                          }
                                          p={"4px"}
                                          borderRadius={"100px"}
                                          fontSize={"18px"}
                                        >
                                          <FaCogs />
                                        </Flex>
                                        <Flex>Machine</Flex>
                                        {isWOMValid ? (
                                          <Flex fontSize={"18px"}>
                                            <IoCheckmarkSharp />
                                          </Flex>
                                        ) : (
                                          ""
                                        )}
                                      </Flex>
                                      <Flex
                                        cursor={"pointer"}
                                        color={"#bababa"}
                                        _hover={{ color: "black" }}
                                        gap={"10px"}
                                        alignItems={"center"}
                                      >
                                        {/* <WorkFlowStepBadges val={val} /> */}
                                        <AccordionIcon />
                                      </Flex>
                                    </Flex>
                                  </AccordionButton>
                                  <AccordionPanel
                                    bg={"#f8f9fa"}
                                    // _hover={{ bg: "#f7f9fa" }}
                                    p={"20px"}
                                    transition={"0.2s ease-in-out"}
                                  >
                                    <Accordion
                                      index={openMachineIndexes}
                                      onChange={setOpenMachineIndexes}
                                      allowMultiple
                                      w={"100%"}
                                    >
                                      <Flex flexDir={"column"} gap={"20px"}>
                                        <Flex flexDir={"column"}>
                                          <Flex fontWeight={700}>
                                            Assigned Machines :
                                          </Flex>
                                          {/* <Flex fontSize={"14px"} color={"#848484"}>
                                        Finished 0 out of{" "}
                                        {
                                          workOrderStep
                                            ?.work_order_step_machines?.length
                                        }{" "}
                                        machine
                                      </Flex> */}
                                        </Flex>
                                        {workOrderStep?.work_order_step_machines?.map(
                                          (machine, machineIndex) => {
                                            return (
                                              <Flex
                                                flexDir={"column"}
                                                gap={"5px"}
                                              >
                                                <AccordionItem
                                                  border={"none"}
                                                  bg={"white"}
                                                  boxShadow={
                                                    "0px 0px 3px rgba(50,50,93,0.5)"
                                                  }
                                                >
                                                  <AccordionButton
                                                    p={0}
                                                    px={"10px"}
                                                    py={"10px"}
                                                    borderBottom={
                                                      "1px solid #bababa"
                                                    }
                                                    _hover={{}}
                                                    bg={"#dc143c"}
                                                    color={"white"}
                                                  >
                                                    <Flex
                                                      w={"100%"}
                                                      alignItems={"center"}
                                                      justify={"space-between"}
                                                      fontWeight={700}
                                                      fontSize={"18px"}
                                                    >
                                                      <Flex>
                                                        {machineIndex + 1}.{" "}
                                                        {machine.name}
                                                      </Flex>
                                                      <Flex
                                                        _hover={{
                                                          color: "#848484",
                                                        }}
                                                      >
                                                        <AccordionIcon />
                                                      </Flex>
                                                    </Flex>
                                                  </AccordionButton>
                                                  <AccordionPanel
                                                    bg={"white"}
                                                    p={"20px"}
                                                  >
                                                    <Flex
                                                      flexDir={"column"}
                                                      gap={"20px"}
                                                    >
                                                      <Flex flexDir={"column"}>
                                                        <Flex fontWeight={700}>
                                                          Inspection Forms :
                                                        </Flex>
                                                      </Flex>
                                                      <Accordion
                                                        allowMultiple
                                                        index={
                                                          openMachineInspectionFormIndexes[
                                                            machineIndex
                                                          ]
                                                        }
                                                        onChange={(
                                                          newIndexes
                                                        ) => {
                                                          setOpenMachineInspectionFormIndexes(
                                                            (prev) => {
                                                              const copy = [
                                                                ...prev,
                                                              ];
                                                              copy[
                                                                machineIndex
                                                              ] = newIndexes; // update only the current machine's accordion

                                                              return copy;
                                                            }
                                                          );
                                                        }}
                                                        w={"100%"}
                                                      >
                                                        <Flex
                                                          flexDir={"column"}
                                                          gap={"20px"}
                                                        >
                                                          {machine.selected_inspection_forms.map(
                                                            (
                                                              inspectionForm,
                                                              inspectionFormIndex
                                                            ) => {
                                                              stepMachinesCounterIndex++;
                                                              const currentStepMachinesCounterIndex =
                                                                stepMachinesCounterIndex;

                                                              const isMachineVerified =
                                                                getValues(
                                                                  `workOrderStepMachines[${currentStepMachinesCounterIndex}].isMachineVerified`
                                                                );
                                                              const isCompleted =
                                                                getValues(
                                                                  `workOrderStepMachines[${currentStepMachinesCounterIndex}].isCompleted`
                                                                );
                                                              return (
                                                                <>
                                                                  <AccordionItem
                                                                    boxShadow={
                                                                      isCompleted
                                                                        ? "0px 0px 3px rgba(61, 150, 102, 0.5)"
                                                                        : isMachineVerified
                                                                        ? "0px 0px 3px rgba(220, 20, 60,0.5)"
                                                                        : "0px 0px 3px rgba(50,50,93,0.5)"
                                                                    }
                                                                    border={
                                                                      "none"
                                                                    }
                                                                    // ref={assignRefs}
                                                                  >
                                                                    <AccordionButton
                                                                      // ref={assignRefs}
                                                                      p={0}
                                                                      _expanded={{
                                                                        borderBottom:
                                                                          "1px solid #bababa",
                                                                      }}
                                                                      bg={
                                                                        "#EDF2F7"
                                                                      }
                                                                    >
                                                                      <Flex
                                                                        w={
                                                                          "100%"
                                                                        }
                                                                        p={
                                                                          "10px"
                                                                        }
                                                                        fontWeight={
                                                                          700
                                                                        }
                                                                        justify={
                                                                          "space-between"
                                                                        }
                                                                        bg={
                                                                          isCompleted
                                                                            ? "#DBF6CB"
                                                                            : isMachineVerified
                                                                            ? "#FDE2E2"
                                                                            : "#bababa"
                                                                        }
                                                                        color={
                                                                          isCompleted
                                                                            ? "#3D9666"
                                                                            : isMachineVerified
                                                                            ? "#dc143c"
                                                                            : "white"
                                                                        }
                                                                      >
                                                                        <Flex>
                                                                          {
                                                                            inspectionForm
                                                                              .work_order_step_inspection_form
                                                                              .name
                                                                          }
                                                                        </Flex>{" "}
                                                                        <Flex
                                                                          cursor={
                                                                            "pointer"
                                                                          }
                                                                          gap={
                                                                            "10px"
                                                                          }
                                                                          alignItems={
                                                                            "center"
                                                                          }
                                                                        >
                                                                          {/* <WorkFlowStepBadges val={val} /> */}
                                                                          <Flex
                                                                            gap={
                                                                              "5px"
                                                                            }
                                                                          >
                                                                            {isCompleted ? (
                                                                              <Tooltip
                                                                                hasArrow
                                                                                placement="top"
                                                                                bg={
                                                                                  "#3D9666"
                                                                                }
                                                                                color={
                                                                                  "white"
                                                                                }
                                                                                label="Completed"
                                                                              >
                                                                                <Flex
                                                                                  fontSize={
                                                                                    "20px"
                                                                                  }
                                                                                >
                                                                                  <FiCheckCircle />
                                                                                </Flex>
                                                                              </Tooltip>
                                                                            ) : !isMachineVerified ? (
                                                                              <Tooltip
                                                                                hasArrow
                                                                                placement="top"
                                                                                label="Require Verification"
                                                                              >
                                                                                <Flex
                                                                                  fontSize={
                                                                                    "20px"
                                                                                  }
                                                                                >
                                                                                  <IoMdLock />
                                                                                </Flex>
                                                                              </Tooltip>
                                                                            ) : (
                                                                              ""
                                                                            )}
                                                                            <AccordionIcon />
                                                                          </Flex>
                                                                        </Flex>
                                                                      </Flex>
                                                                    </AccordionButton>
                                                                    <AccordionPanel
                                                                      bg={
                                                                        isCompleted
                                                                          ? "#f5fff0"
                                                                          : isMachineVerified
                                                                          ? "#FFF7F7"
                                                                          : "#f8f9fa"
                                                                      }
                                                                      p={"20px"}
                                                                    >
                                                                      {isCompleted ? (
                                                                        <Flex
                                                                          flexDir={
                                                                            "column"
                                                                          }
                                                                          gap={
                                                                            "10px"
                                                                          }
                                                                        >
                                                                          <Flex
                                                                            flexDir={
                                                                              "column"
                                                                            }
                                                                            gap={
                                                                              "5px"
                                                                            }
                                                                          >
                                                                            <Flex
                                                                              fontWeight={
                                                                                700
                                                                              }
                                                                              onClick={() => {
                                                                                console.log(
                                                                                  workOrder
                                                                                    .work_order_step
                                                                                    .attempt
                                                                                );

                                                                                console.log(
                                                                                  inspectionForm
                                                                                    .work_order_step_inspection_form
                                                                                    .work_order_step_inspection_form_submission[
                                                                                    workOrder
                                                                                      .work_order_step
                                                                                      .attempt ||
                                                                                      0
                                                                                  ]
                                                                                );
                                                                              }}
                                                                            >
                                                                              Submitted
                                                                              by
                                                                              :
                                                                            </Flex>
                                                                            <MemberGroupList
                                                                              grayBg={
                                                                                false
                                                                              }
                                                                              memberArray={[
                                                                                inspectionForm
                                                                                  .work_order_step_inspection_form
                                                                                  .work_order_step_inspection_form_submission[
                                                                                  workOrder
                                                                                    .work_order_step
                                                                                    .attempt ||
                                                                                    0
                                                                                ]
                                                                                  .user,
                                                                              ]}
                                                                              isDataUserFirst={
                                                                                true
                                                                              }
                                                                            />
                                                                          </Flex>
                                                                          <Flex
                                                                            gap={
                                                                              "10px"
                                                                            }
                                                                          >
                                                                            <Flex
                                                                              fontWeight={
                                                                                700
                                                                              }
                                                                            >
                                                                              Date
                                                                              &
                                                                              Time:
                                                                            </Flex>
                                                                            <Flex>
                                                                              {moment(
                                                                                inspectionForm
                                                                                  .work_order_step_inspection_form
                                                                                  .work_order_step_inspection_form_submission[
                                                                                  workOrder
                                                                                    .work_order_step
                                                                                    .attempt ||
                                                                                    0
                                                                                ]
                                                                                  .created_at
                                                                              ).format(
                                                                                "DD MMMM YYYY - hh:mm A"
                                                                              )}
                                                                            </Flex>
                                                                          </Flex>
                                                                        </Flex>
                                                                      ) : !isMachineVerified ? (
                                                                        <>
                                                                          <Flex
                                                                            flexDir={
                                                                              "column"
                                                                            }
                                                                            gap={
                                                                              "16px"
                                                                            }
                                                                            fontSize={
                                                                              "14px"
                                                                            }
                                                                          >
                                                                            <Flex
                                                                              flexDir={
                                                                                "column"
                                                                              }
                                                                              gap={
                                                                                "8px"
                                                                              }
                                                                            >
                                                                              <Flex
                                                                                fontWeight={
                                                                                  700
                                                                                }
                                                                              >
                                                                                {
                                                                                  machine.name
                                                                                }

                                                                                —
                                                                                This
                                                                                machine
                                                                                must
                                                                                be
                                                                                verified
                                                                                before
                                                                                you
                                                                                can
                                                                                continue.
                                                                              </Flex>
                                                                              <Flex
                                                                                fontSize={
                                                                                  "14px"
                                                                                }
                                                                                color={
                                                                                  "#848484"
                                                                                }
                                                                                flexDir={
                                                                                  "column"
                                                                                }
                                                                                onClick={() => {
                                                                                  console.log(
                                                                                    currentStepMachinesCounterIndex
                                                                                  );

                                                                                  console.log(
                                                                                    get(
                                                                                      errors,
                                                                                      `workOrderStepMachines[${currentStepMachinesCounterIndex}]`
                                                                                    )
                                                                                  );
                                                                                  console.log(
                                                                                    get(
                                                                                      errors,
                                                                                      `workOrderStepMachines[${currentStepMachinesCounterIndex}].isMachineVerify`
                                                                                    )
                                                                                  );
                                                                                }}
                                                                              >
                                                                                <Flex>
                                                                                  To
                                                                                  unlock:
                                                                                </Flex>
                                                                                <Flex>
                                                                                  •
                                                                                  Scan
                                                                                  QR
                                                                                  Code
                                                                                  attached
                                                                                  to
                                                                                  the
                                                                                  machine
                                                                                </Flex>
                                                                                <Flex>
                                                                                  •
                                                                                  OR
                                                                                  enter
                                                                                  the
                                                                                  machine
                                                                                  UID
                                                                                  manually
                                                                                </Flex>
                                                                              </Flex>
                                                                            </Flex>
                                                                            <Flex>
                                                                              <Button
                                                                                onClick={() => {
                                                                                  console.log(
                                                                                    currentStepMachinesCounterIndex
                                                                                  );

                                                                                  openVerifyMachineModal(
                                                                                    machine,
                                                                                    currentStepMachinesCounterIndex
                                                                                  );
                                                                                }}
                                                                                border={
                                                                                  "2px dashed #dc143c"
                                                                                }
                                                                                bg={
                                                                                  "white"
                                                                                }
                                                                                color={
                                                                                  "#dc143c"
                                                                                }
                                                                                h={
                                                                                  "28px"
                                                                                }
                                                                                fontSize={
                                                                                  "14px"
                                                                                }
                                                                                px={
                                                                                  "8px"
                                                                                }
                                                                              >
                                                                                <Flex
                                                                                  alignItems={
                                                                                    "center"
                                                                                  }
                                                                                  gap={
                                                                                    "5px"
                                                                                  }
                                                                                >
                                                                                  <Flex
                                                                                    fontSize={
                                                                                      "18px"
                                                                                    }
                                                                                  >
                                                                                    <TbLineScan />
                                                                                  </Flex>
                                                                                  <Flex>
                                                                                    Verify
                                                                                    Machine
                                                                                  </Flex>
                                                                                </Flex>
                                                                              </Button>
                                                                            </Flex>
                                                                          </Flex>
                                                                        </>
                                                                      ) : (
                                                                        <Flex
                                                                          flexDir={
                                                                            "column"
                                                                          }
                                                                          gap={
                                                                            "20px"
                                                                          }
                                                                        >
                                                                          <Flex
                                                                            flexDir={
                                                                              "column"
                                                                            }
                                                                          >
                                                                            <Flex
                                                                              fontWeight={
                                                                                700
                                                                              }
                                                                            >
                                                                              Form
                                                                              Questions
                                                                              :
                                                                            </Flex>
                                                                          </Flex>
                                                                          {inspectionForm.work_order_step_inspection_form.work_order_step_inspection_questions.map(
                                                                            (
                                                                              inspectionQuestion,
                                                                              inspectionQuestionIndex
                                                                            ) => {
                                                                              return (
                                                                                <Flex
                                                                                  bg={
                                                                                    "white"
                                                                                  }
                                                                                  flexDir={
                                                                                    "column"
                                                                                  }
                                                                                  p={
                                                                                    "20px"
                                                                                  }
                                                                                  boxShadow={
                                                                                    "0px 0px 3px rgba(50,50,93,0.5)"
                                                                                  }
                                                                                  gap={
                                                                                    "10px"
                                                                                  }
                                                                                >
                                                                                  <Flex
                                                                                    gap={
                                                                                      "10px"
                                                                                    }
                                                                                    fontWeight={
                                                                                      700
                                                                                    }
                                                                                  >
                                                                                    <Flex
                                                                                      color={
                                                                                        "#dc143c"
                                                                                      }
                                                                                    >
                                                                                      {inspectionQuestionIndex +
                                                                                        1}

                                                                                      .
                                                                                    </Flex>
                                                                                    <Flex>
                                                                                      {
                                                                                        inspectionQuestion.question
                                                                                      }
                                                                                      &nbsp;
                                                                                      {inspectionQuestion.is_required ? (
                                                                                        <Box
                                                                                          as="span"
                                                                                          color={
                                                                                            "#dc143c"
                                                                                          }
                                                                                        >
                                                                                          *
                                                                                        </Box>
                                                                                      ) : (
                                                                                        ""
                                                                                      )}
                                                                                    </Flex>
                                                                                  </Flex>
                                                                                  <Flex
                                                                                    pl={
                                                                                      "24px"
                                                                                    }
                                                                                  >
                                                                                    <SubmitQuestionTypeMapper
                                                                                      type={
                                                                                        inspectionQuestion.question_type
                                                                                      }
                                                                                      options={
                                                                                        inspectionQuestion.options
                                                                                      }
                                                                                      format={
                                                                                        inspectionQuestion.format
                                                                                      }
                                                                                      unit={
                                                                                        inspectionQuestion.unit
                                                                                      }
                                                                                      include_date={
                                                                                        inspectionQuestion.include_date
                                                                                      }
                                                                                      include_time={
                                                                                        inspectionQuestion.include_time
                                                                                      }
                                                                                      register={
                                                                                        register
                                                                                      }
                                                                                      registerId={`workOrderStepMachines[${currentStepMachinesCounterIndex}].workOrderInspectionQuestions[${inspectionQuestionIndex}].response`}
                                                                                      errors={
                                                                                        errors
                                                                                      }
                                                                                      getValues={
                                                                                        getValues
                                                                                      }
                                                                                      setValue={
                                                                                        setValue
                                                                                      }
                                                                                      trigger={
                                                                                        trigger
                                                                                      }
                                                                                    />
                                                                                  </Flex>
                                                                                </Flex>
                                                                              );
                                                                            }
                                                                          )}
                                                                          <Flex
                                                                            w={
                                                                              "100%"
                                                                            }
                                                                            justifyContent={
                                                                              "end"
                                                                            }
                                                                          >
                                                                            <Button
                                                                              h={
                                                                                "28px"
                                                                              }
                                                                              px={
                                                                                "10px"
                                                                              }
                                                                              color={
                                                                                "white"
                                                                              }
                                                                              bg={
                                                                                "#dc143c"
                                                                              }
                                                                              fontSize={
                                                                                "14px"
                                                                              }
                                                                              _hover={{
                                                                                background:
                                                                                  "#b51031",
                                                                              }}
                                                                              isLoading={
                                                                                submitInspectionFormButtonLoading
                                                                              }
                                                                              onClick={() => {
                                                                                submitInspectionForm(
                                                                                  inspectionForm
                                                                                    .work_order_step_inspection_form
                                                                                    .UID,
                                                                                  `workOrderStepMachines[${currentStepMachinesCounterIndex}].workOrderInspectionQuestions`
                                                                                );
                                                                              }}
                                                                            >
                                                                              Submit
                                                                              Form
                                                                            </Button>
                                                                          </Flex>
                                                                        </Flex>
                                                                      )}
                                                                    </AccordionPanel>
                                                                  </AccordionItem>
                                                                  {get(
                                                                    errors,
                                                                    `workOrderStepMachines[${currentStepMachinesCounterIndex}].isMachineVerified`
                                                                  ) ? (
                                                                    <Flex
                                                                      flexDir={
                                                                        "column"
                                                                      }
                                                                    >
                                                                      <Checkbox
                                                                        {...register(
                                                                          `workOrderStepMachines[${currentStepMachinesCounterIndex}].isMachineVerified`,
                                                                          {
                                                                            valueAsBoolean: true,
                                                                          }
                                                                        )}
                                                                        opacity="0"
                                                                        position="absolute"
                                                                        pointerEvents="none"
                                                                        height="1px"
                                                                        width="1px"
                                                                        tabIndex={
                                                                          -1
                                                                        }
                                                                        aria-hidden="true"
                                                                      />

                                                                      <Flex
                                                                        color="crimson"
                                                                        fontSize="14px"
                                                                        gap="5px"
                                                                        alignItems="center"
                                                                        py={
                                                                          "2px"
                                                                        }
                                                                        px={
                                                                          "8px"
                                                                        }
                                                                        bg={
                                                                          "#FDE2E2"
                                                                        }
                                                                      >
                                                                        <FaTriangleExclamation />
                                                                        <Flex>
                                                                          {
                                                                            get(
                                                                              errors,
                                                                              `workOrderStepMachines[${currentStepMachinesCounterIndex}].isMachineVerified`
                                                                            )
                                                                              .message
                                                                          }
                                                                        </Flex>
                                                                      </Flex>
                                                                    </Flex>
                                                                  ) : get(
                                                                      errors,
                                                                      `workOrderStepMachines[${currentStepMachinesCounterIndex}].isCompleted`
                                                                    ) ? (
                                                                    <Flex
                                                                      flexDir={
                                                                        "column"
                                                                      }
                                                                    >
                                                                      <Checkbox
                                                                        {...register(
                                                                          `workOrderStepMachines[${currentStepMachinesCounterIndex}].isCompleted`,
                                                                          {
                                                                            valueAsBoolean: true,
                                                                          }
                                                                        )}
                                                                        opacity="0" // 👈 fully invisible
                                                                        position="absolute" // 👈 doesn't affect layout if you want
                                                                        pointerEvents="none" // 👈 user can't click it
                                                                        height="1px" // 👈 scroll target still exists
                                                                        width="1px"
                                                                        tabIndex={
                                                                          -1
                                                                        } // 👈 user won't tab into it
                                                                        aria-hidden="true" // 👈 not a real UI element
                                                                      />
                                                                      <Flex
                                                                        color="crimson"
                                                                        fontSize="14px"
                                                                        gap="5px"
                                                                        alignItems="center"
                                                                        py={
                                                                          "2px"
                                                                        }
                                                                        px={
                                                                          "8px"
                                                                        }
                                                                        bg={
                                                                          "#FDE2E2"
                                                                        }
                                                                      >
                                                                        <FaTriangleExclamation />
                                                                        <Flex>
                                                                          {
                                                                            get(
                                                                              errors,
                                                                              `workOrderStepMachines[${currentStepMachinesCounterIndex}].isCompleted`
                                                                            )
                                                                              .message
                                                                          }
                                                                        </Flex>
                                                                      </Flex>
                                                                    </Flex>
                                                                  ) : (
                                                                    ""
                                                                  )}
                                                                </>
                                                              );
                                                            }
                                                          )}
                                                        </Flex>
                                                      </Accordion>
                                                    </Flex>
                                                  </AccordionPanel>
                                                </AccordionItem>
                                              </Flex>
                                            );
                                          }
                                        )}
                                      </Flex>
                                    </Accordion>
                                  </AccordionPanel>
                                </AccordionItem>
                              </Accordion>
                            ) : (
                              ""
                            )}

                            {workOrderStep?.condition ? (
                              <Accordion
                                defaultIndex={[0]}
                                w={"100%"}
                                allowToggle
                              >
                                <AccordionItem
                                  ref={(el) => {
                                    taskRefs.current[taskIndexCount] = el;
                                    taskIndexCount++;
                                  }}
                                  shadow={
                                    highlightedIndex === 1
                                      ? "0px 0px 3px rgba(0, 145, 207,1)"
                                      : "0px 0px 3px rgba(50, 50, 93,0.5)"
                                  }
                                >
                                  <AccordionButton
                                    p={0}
                                    _expanded={{
                                      borderBottom: "1px solid #bababa",
                                    }}
                                    bg={isWOCValid ? "#DBF6CB" : "#ECEFF3"}
                                  >
                                    <Flex
                                      w={"100%"}
                                      py={"8px"}
                                      px={"12px"}
                                      alignItems={"center"}
                                      justifyContent={"space-between"}
                                    >
                                      <Flex
                                        color={"#f329ff"}
                                        fontWeight={700}
                                        gap={"5px"}
                                        alignItems={"center"}
                                      >
                                        <Flex
                                          p={"4px"}
                                          borderRadius={"100px"}
                                          fontSize={"18px"}
                                        >
                                          <LuNetwork />
                                        </Flex>
                                        <Flex>Condition</Flex>
                                        {isWOCValid ? (
                                          <Flex fontSize={"18px"}>
                                            <IoCheckmarkSharp />
                                          </Flex>
                                        ) : (
                                          ""
                                        )}
                                      </Flex>
                                      <Flex
                                        cursor={"pointer"}
                                        color={"#bababa"}
                                        _hover={{ color: "black" }}
                                        gap={"10px"}
                                        alignItems={"center"}
                                      >
                                        {/* <WorkFlowStepBadges val={val} /> */}
                                        <AccordionIcon />
                                      </Flex>
                                    </Flex>
                                  </AccordionButton>
                                  <AccordionPanel
                                    bg={"#f8f9fa"}
                                    // _hover={{ bg: "#f7f9fa" }}
                                    p={"20px"}
                                    transition={"0.2s ease-in-out"}
                                  >
                                    <Flex flexDir={"column"} gap={"20px"}>
                                      <Flex
                                        fontSize={"14px"}
                                        color={"#848484"}
                                        alignItems={"center"}
                                        gap={"5px"}
                                      >
                                        <Flex fontSize={"16px"}>
                                          <IoInformationCircle />
                                        </Flex>{" "}
                                        Note : Your response will affect the
                                        route of the workflow.
                                      </Flex>

                                      <Flex flexDir={"column"} gap={"10px"}>
                                        <Box
                                          fontWeight={700}
                                          as="span"
                                          flex="1"
                                          textAlign="left"
                                        >
                                          {workOrderStep.condition_question}
                                        </Box>

                                        <RadioGroup
                                          onChange={(option) => {
                                            console.log(option);

                                            setValue(
                                              "responseConditional",
                                              option,
                                              { shouldValidate: true }
                                            );
                                          }}
                                          // onChange={radioHandler}
                                          // defaultValue={workOrderReview.type}
                                        >
                                          <Flex flexDir={"column"} gap={"10px"}>
                                            {workOrderStep.condition_options?.map(
                                              (conVal) => (
                                                <Flex>
                                                  <Radio
                                                    colorScheme="blue"
                                                    value={conVal}
                                                  >
                                                    <Flex flexDir={"column"}>
                                                      <Box
                                                        as="span"
                                                        flex="1"
                                                        textAlign="left"
                                                      >
                                                        {conVal}
                                                      </Box>
                                                    </Flex>
                                                  </Radio>
                                                </Flex>
                                              )
                                            )}
                                          </Flex>
                                        </RadioGroup>
                                      </Flex>
                                      <Input
                                        {...register("responseConditional")}
                                        tabIndex={-1}
                                        aria-hidden="true"
                                        style={{
                                          position: "absolute",
                                          opacity: 0,
                                          pointerEvents: "none",
                                          height: 0,
                                          width: 0,
                                        }}
                                      ></Input>
                                      {get(errors, "responseConditional") ? (
                                        <Flex
                                          color="crimson"
                                          fontSize="14px"
                                          gap="5px"
                                          alignItems="center"
                                        >
                                          <FaTriangleExclamation />
                                          <Flex>
                                            {
                                              get(errors, "responseConditional")
                                                .message
                                            }
                                          </Flex>
                                        </Flex>
                                      ) : (
                                        ""
                                      )}
                                    </Flex>
                                  </AccordionPanel>
                                </AccordionItem>
                              </Accordion>
                            ) : (
                              ""
                            )}
                          </Flex>
                        </Flex>
                      </Flex>
                    </Flex>
                    <SubmitWorkOrderStepSideMenu
                      submitButtonLoading={submitButtonLoading}
                      submitWorkOrderStep={submitWorkOrderStep}
                      handleSubmit={handleSubmit}
                      setOpenMachineInspectionFormIndexes={
                        setOpenMachineInspectionFormIndexes
                      }
                      setOpenMachineIndexes={setOpenMachineIndexes}
                      setSubmitScope={setSubmitScope}
                      workOrderStep={workOrderStep}
                      validStepCount={validStepCount}
                      taskRefs={taskRefs}
                      highlightedIndex={highlightedIndex}
                      getTaskCounter={getTaskCounter}
                      isWOMValid={isWOMValid}
                      isWOQValid={isWOQValid}
                      isWOCValid={isWOCValid}
                      hasNotify={workOrderStep?.notify ? true : false}
                    />
                  </Flex>
                  <Flex pt={"20px"} justifyContent={"space-between"}>
                    <VerifyMachineUIDModal
                      setValue={setValue}
                      selectedVerifyMachine={selectedVerifyMachine}
                      onClose={verifyMachineUIDDisclosure.onClose}
                      isOpen={verifyMachineUIDDisclosure.isOpen}
                    />
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
          {loading && <LoadingOverlay />}
        </>
      ) : (
        <Center flexDir={"column"} w={"100%"} h={"100vh"}>
          <Flex color={"#dc143c"} fontSize={"56px"} fontWeight={700}>
            OOPS...
          </Flex>
          <Image w={"30%"} src={image404}></Image>
          <Center flexDir={"column"} gap={"20px"}>
            <Center flexDir={"column"}>
              <Flex color={"#dc143c"} fontWeight={700} fontSize={"32px"}>
                The work order task you are looking for doesn't exist
              </Flex>
              <Flex fontSize={"16px"} color={"#848484"}>
                The task might be cancelled, finished or it never existed
              </Flex>
            </Center>
            <Link to={`/assigned-work-order${location.search}`}>
              <Button color={"white"} bg={"#dc143c"}>
                <Flex alignItems={"center"} gap={"10px"}>
                  <FaArrowLeftLong />
                  Go Back
                </Flex>
              </Button>
            </Link>
          </Center>
        </Center>
      )}
    </>
  );
}
