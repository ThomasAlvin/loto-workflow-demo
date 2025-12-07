import CreateTemplateBuildPage from "./CreateTemplateBuildPage";
import CreateTemplateAccessPage from "./CreateTemplateAccessPage";
import { useEffect, useState } from "react";
import { debounce } from "lodash";
import { useLoading } from "../../service/LoadingContext";
import { api } from "../../api/api";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import SwalErrorMessages from "../../components/SwalErrorMessages";
import { ReactFlowProvider, useEdgesState, useNodesState } from "@xyflow/react";
import { DeleteMultiLockAccessProvider } from "../../service/DeleteMultiLockAccessContext";
import getConnectedNodes from "../utils/getConnectedNodes";
import convertToFormData from "../utils/convertToFormData";

export default function CreateTemplatePage() {
  const nav = useNavigate();
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
  const initialTemplateDetails = {
    name: "",
    description: "",
    access: [],
  };
  const [templateDetails, setTemplateDetails] = useState(
    initialTemplateDetails
  );
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
    };
    //disabled cause template don't save workflow images
    // const workFlowImage = await getWorkFlowImage();

    const formData = convertToFormData(formDataObject);
    //disabled cause template don't save workflow images
    // formData.append("flowChartImages[]", workFlowImage);

    await api
      .post(`template?status=${status}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
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
  return (
    <ReactFlowProvider>
      <DeleteMultiLockAccessProvider>
        {(() => {
          switch (currentPage) {
            case "build":
              return (
                <CreateTemplateBuildPage
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
                <CreateTemplateAccessPage
                  templateDetails={templateDetails}
                  setTemplateDetails={setTemplateDetails}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  submitTemplate={submitTemplate}
                  formik={formik}
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
