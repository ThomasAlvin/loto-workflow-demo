import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { debounce } from "lodash";
import EditTemplateBuildPage from "./EditTemplateBuildPage";
import EditTemplateAccessPage from "./EditTemplateAccessPage";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/api";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useLoading } from "../../service/LoadingContext";
import Swal from "sweetalert2";
import SwalErrorMessages from "../../components/SwalErrorMessages";
import convertToFormData from "../../utils/convertToFormData";
import { ReactFlowProvider, useEdgesState, useNodesState } from "@xyflow/react";
import { DeleteMultiLockAccessProvider } from "../../service/DeleteMultiLockAccessContext";
import getConnectedNodes from "../../utils/getConnectedNodes";
import convertStepsToXyFlowData from "../../utils/convertStepsToXyFlowData";

export default function EditTemplatePage() {
  const nav = useNavigate();
  const { UID } = useParams();
  const { loading, setLoading } = useLoading();
  const [currentPage, setCurrentPage] = useState("build");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const initialValues = {
    name: "",
    templateSteps: [],
  };
  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: Yup.object().shape({
      templateSteps: Yup.array()
        .min(1, "At least one step is required") // Validate items array
        .required("This field cannot be empty"), // Ensure the items array exists
      name: Yup.string("Name must be a string").required(
        "Template title is required"
      ),
    }),
    onSubmit: () => {
      setCurrentPage("access");
    },
  });
  const [templateDetails, setTemplateDetails] = useState({
    UID: "",
    name: "",
    description: "",
    access: [],
  });
  const debouncedUpdateTemplateDetails = debounce(function (id, value) {
    setTemplateDetails((prevState) => ({ ...prevState, [id]: value }));
    if (id === "name") {
      formik.setFieldTouched(id);
      formik.setFieldValue(id, value);
    }
  }, 300);
  useEffect(() => {
    formik.validateForm();
  }, [formik.values.name]);

  async function submitTemplate(
    status,
    setButtonLoading,
    closeModalFn,
    titleInput
  ) {
    if (setButtonLoading) {
      setButtonLoading(true);
    } else {
      setLoading(true);
    }
    const startNode = nodes.find((n) => n.data.isStart);
    const connectedNodeIds = getConnectedNodes(startNode, edges);
    const connectedNodes = nodes
      .filter((n) => connectedNodeIds.has(n.id))
      .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0));

    const filteredWorkFlow = connectedNodes.map((item) => {
      const filteredItem = { ...item.data };

      if (!filteredItem.form) {
        delete filteredItem.formQuestions;
      }

      if (!filteredItem.notify) {
        delete filteredItem.notificationMessage;
      }

      return filteredItem;
    });

    let formDataObject = {
      ...templateDetails,
      name: titleInput || templateDetails.name,
      workFlow: filteredWorkFlow,
      access: templateDetails.access.filter(
        (templateAccess) => templateAccess.role !== "owner"
      ),
    };

    // disabled cause template don't save workflow images
    // const workFlowImage = await getWorkFlowImage();
    const formData = convertToFormData(formDataObject);
    // disabled cause template don't save workflow images
    // formData.append("flowChartImages[]", workFlowImage);

    await api
      .testSubmit("Template saved successfully")
      .then((response) => {
        Swal.fire({
          title: "Success!",
          text: response?.data?.message,
          icon: "success",
          customClass: {
            popup: "swal2-custom-popup",
            title: "swal2-custom-title",
            content: "swal2-custom-content",
            actions: "swal2-custom-actions",
            confirmButton: "swal2-custom-confirm-button",
          },
        });
        nav("/template");
      })
      .catch((error) => {
        Swal.fire({
          title: "Oops...",
          icon: "error",
          html: SwalErrorMessages(error.response.data.message),
          customClass: {
            popup: "swal2-custom-popup",
            title: "swal2-custom-title",
            content: "swal2-custom-content",
            actions: "swal2-custom-actions",
            confirmButton: "swal2-custom-confirm-button",
          },
        });
      })
      .finally(() => {
        if (setButtonLoading) {
          setButtonLoading(false);
        } else {
          setLoading(false);
        }
        if (closeModalFn) closeModalFn();
      });
  }
  async function fetchTemplate(controller) {
    setLoading(true);
    await api
      .getTemplateByUID(UID)
      .then(async (response) => {
        const fetchedColumn = {
          templateSteps: response.data.template.template_steps.map((step) => ({
            // switch id to UID
            // id: step.UID,
            // id: step.UID,
            UID: step.UID,
            name: step.name,
            description: step.description || "",
            form: !!step.form,
            notify: !!step.notify,
            notificationMessage: step.notification_message || "",
            machine: !!step.machine,
            multiLockAccess: !!step.multi_access_lock,
            isMainMultiLockAccess: !!step.is_main_multi_access_lock,
            ...(step?.multi_access_lock_step_index != null && {
              multiLockAccessStepIndex: Number(
                step.multi_access_lock_step_index
              ),
            }),
            ...(!!step.multi_access_lock && {
              multiLockAccessGroup: {
                ...(step.template_multi_lock_group?.name && {
                  name: step.template_multi_lock_group.name,
                }),
                ...(step.template_multi_lock_group?.is_pre_assigned != null && {
                  isPreAssigned: step.template_multi_lock_group.is_pre_assigned,
                }),
                ...(step.template_multi_lock_group?.total_step != null && {
                  totalStep: step.template_multi_lock_group.total_step,
                }),
              },
            }),
            condition: !!step.condition,
            condition_question: step.condition_question || "",
            condition_value: step.condition_value,
            loop_target_UID: step.loop_target_UID,
            parent_UID: step.parent_UID,
            formQuestions: step.template_form_questions.map((question) => {
              const type = {
                title: question.question_type,
                ...(question.question_type === "Number" && {
                  format: question.format,
                  unit: question.unit,
                }),
                ...(question.question_type === "Text" && {
                  format: question.format,
                }),
                ...((question.question_type === "Multiple Choice" ||
                  question.question_type === "Checkbox" ||
                  question.question_type === "Checklist") && {
                  options: question.options,
                }),
                ...(question.question_type === "Date & Time" && {
                  date: question.include_date,
                  time: question.include_time,
                }),
              };
              return {
                id: uuid(),
                title: question.question,
                required: !!question.is_required,
                type,
              };
            }),
          })),
        };

        const fetchedTemplateDetails = {
          UID: response.data.template.UID,
          name: response.data.template.name,
          description: response.data.template.description,
          status: response.data.template.status,
          access: response.data.template.template_access.map((accessValue) => ({
            super_admin: accessValue.super_admin,
            memberId: accessValue.member?.id,
            first_name:
              accessValue.member?.user?.first_name ||
              accessValue.super_admin?.first_name,
            last_name:
              accessValue.member?.user?.last_name ||
              accessValue.super_admin?.last_name,
            profile_image_url:
              accessValue.member?.user?.profile_image_url ||
              accessValue.super_admin?.profile_image_url,
            email:
              accessValue.member?.user?.email || accessValue.super_admin?.email,
            role: accessValue.role,
            conduct: !!accessValue.conduct,
            edit: !!accessValue.edit,
            delete: !!accessValue.delete,
          })),
        };
        setTemplateDetails(fetchedTemplateDetails);
        formik.setValues({
          ...fetchedTemplateDetails,
          ...fetchedColumn,
        });

        const xyFlowData = await convertStepsToXyFlowData(
          fetchedColumn.templateSteps
        );

        setNodes(xyFlowData?.nodes);
        setEdges(xyFlowData?.edges);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    const controller = new AbortController();
    fetchTemplate(controller);

    return () => {
      controller.abort();
    };
  }, []);
  return (
    <ReactFlowProvider>
      <DeleteMultiLockAccessProvider>
        {(() => {
          switch (currentPage) {
            case "build":
              return (
                <EditTemplateBuildPage
                  submitTemplate={submitTemplate}
                  initialValues={initialValues}
                  templateDetails={templateDetails}
                  debouncedUpdateTemplateDetails={
                    debouncedUpdateTemplateDetails
                  }
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  formik={formik}
                  nodes={nodes}
                  setNodes={setNodes}
                  onNodesChange={onNodesChange}
                  edges={edges}
                  setEdges={setEdges}
                  onEdgesChange={onEdgesChange}
                />
              );

            case "access":
              return (
                <EditTemplateAccessPage
                  submitTemplate={submitTemplate}
                  formik={formik}
                  templateDetails={templateDetails}
                  setTemplateDetails={setTemplateDetails}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  nodes={nodes}
                  edges={edges}
                />
              );

            default:
              return null;
          }
        })()}
      </DeleteMultiLockAccessProvider>
    </ReactFlowProvider>
  );
}
