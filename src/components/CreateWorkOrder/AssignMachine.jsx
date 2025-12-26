import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Td,
  Tr,
} from "@chakra-ui/react";
import { FaChevronDown } from "react-icons/fa";
import { FaTriangleExclamation } from "react-icons/fa6";
import ReactSelect from "react-select";

export default function AssignMachine({
  openAccordions,
  toggleAccordion,
  selectedMachine,
  selectedMachineIndex,
  handleCallToAction,
  getCustomReactSelectStyles,
  stepIndex,
  editStepDrawerFormik,
}) {
  const addedIds = new Set(); // Track added IDs
  const inspectionFormSelection = selectedMachine?.categories?.flatMap(
    (val) => {
      return val.inspection_forms
        .filter((val2) => {
          if (addedIds.has(val2.id)) {
            return false; // Don't add this form if the ID is already added
          }
          addedIds.add(val2.id);
          return true; // Add this form
        })
        .map((val2) => ({
          ...val2,
          label: val2.name,
          value: val2.id,
          categoryId: val2.pivot.categoryId,
          categoryName: val.name,
          inspectionFormId: val2.pivot.inspection_formId,
        }));
    }
  );

  const isOpen = openAccordions.includes(selectedMachineIndex);
  function inspectionFormSelectHandler(event) {
    editStepDrawerFormik.setValues((prevState) => ({
      ...prevState,
      selectedMachines: prevState.selectedMachines.map(
        (machine, machineIndex) => {
          if (machineIndex === selectedMachineIndex) {
            return { ...machine, selectedInspectionForms: event }; // Fix typo
          }
          return machine;
        }
      ),
    }));
  }

  return (
    <>
      <Tr
        cursor={"pointer"}
        bg={"#f9f9f9"}
        onClick={() => toggleAccordion(selectedMachineIndex)}
        _hover={{ background: "#ededed" }}
        transition={"background ease-in-out 0.1s"}
        border={"none"}
        fontSize={"13px"}
      >
        <Td whiteSpace={"normal"} px={"8px"}>
          {selectedMachine?.name}
        </Td>
        <Td whiteSpace={"normal"} px={"8px"}>
          {selectedMachine?.custom_machine_id}
        </Td>
        <Td whiteSpace={"normal"} px={"8px"}>
          {selectedMachine?.model}
        </Td>
        <Td whiteSpace={"normal"} px={"8px"}>
          {selectedMachine?.serial_number || "-"}
        </Td>
        <Td border={"none"} pr={"16px"} pl={"0px"}>
          <Flex
            fontSize={"12px"}
            h={"100%"}
            transition="transform 0.3s ease"
            transform={isOpen ? "rotate(180deg)" : "rotate(0deg)"}
          >
            <FaChevronDown />
          </Flex>
        </Td>
      </Tr>
      <Tr>
        <Td colSpan={5} p={0}>
          <Accordion index={isOpen ? 0 : -1} allowMultiple>
            <AccordionItem border={"none"}>
              <AccordionButton display={"none"} p={0}></AccordionButton>
              <AccordionPanel
                border={"none"}
                px={"10px"}
                py={"10px"}
                pb={"20px"}
              >
                <Flex flexDir={"column"} fontSize={"14px"} gap={"15px"}>
                  <Flex flexDir={"column"}>
                    <Flex alignItems={"center"}>
                      <Flex fontSize={"15px"} fontWeight={700}>
                        Assign Machine Inspection Form&nbsp;
                        <Box as="span" color={"#dc143c"}>
                          *
                        </Box>
                      </Flex>
                    </Flex>
                    <Flex
                      textAlign={"center"}
                      fontSize={"14px"}
                      color={"#848484"}
                      justifyContent={"space-between"}
                    >
                      <Flex>
                        Include Machine inspection form in this step for members
                        to finish
                      </Flex>
                    </Flex>
                    <Flex fontSize={"14px"} flexDir={"column"} w={"100%"}>
                      <ReactSelect
                        classNamePrefix={"react-select"}
                        onBlur={() => {
                          setTimeout(() => {
                            editStepDrawerFormik.setFieldTouched(
                              `workOrderSteps[${stepIndex}].selectedMachines[${selectedMachineIndex}].selectedInspectionForms`,
                              true
                            );
                            editStepDrawerFormik.validateForm();
                          }, 0);
                        }}
                        styles={getCustomReactSelectStyles(
                          "inspectionForm",
                          null,
                          selectedMachineIndex
                        )}
                        isSearchable
                        isClearable
                        isMulti
                        defaultValue={
                          selectedMachine.selectedInspectionForms
                            ? selectedMachine.selectedInspectionForms
                            : null
                        }
                        // value={val.selectedMachines}
                        onChange={(event) => {
                          inspectionFormSelectHandler(event);
                          // machineSelectHandler(event, index);
                        }}
                        options={inspectionFormSelection}
                        noOptionsMessage={() => (
                          <Flex
                            flexDir={"column"}
                            justify={"center"}
                            alignItems={"center"}
                            py={"30px"}
                          >
                            <Flex fontWeight={700} color={"#dc143c"}>
                              No Inspection Form found!
                            </Flex>
                            <Flex color={"#848484"} fontSize={"14px"}>
                              <Flex>Please&nbsp;</Flex>
                              <Flex
                                color={"#dc143c"}
                                cursor={"pointer"}
                                textDecoration={"underline"}
                                onClick={() =>
                                  handleCallToAction("/inspection-form")
                                }
                              >
                                Add a new Inspection Form
                              </Flex>
                              <Flex>&nbsp;now to get started!</Flex>
                            </Flex>
                          </Flex>
                        )}
                      />

                      {Array.isArray(
                        editStepDrawerFormik.errors?.selectedMachines
                      ) &&
                      Array.isArray(
                        editStepDrawerFormik.errors?.selectedMachines
                      ) &&
                      editStepDrawerFormik.errors?.selectedMachines[
                        selectedMachineIndex
                      ]?.selectedInspectionForms &&
                      Array.isArray(
                        editStepDrawerFormik.touched?.selectedMachines
                      ) &&
                      Array.isArray(
                        editStepDrawerFormik.touched?.selectedMachines
                      ) &&
                      editStepDrawerFormik.touched?.selectedMachines[
                        selectedMachineIndex
                      ]?.selectedInspectionForms ? (
                        <Flex
                          py={"4px"}
                          px={"8px"}
                          alignItems={"center"}
                          gap={"5px"}
                          color={"#dc143c"}
                          fontSize={"14px"}
                        >
                          <Flex>
                            <FaTriangleExclamation />
                          </Flex>
                          <Flex>
                            {
                              editStepDrawerFormik.errors?.selectedMachines[
                                selectedMachineIndex
                              ].selectedInspectionForms
                            }
                          </Flex>
                        </Flex>
                      ) : (
                        ""
                      )}
                    </Flex>
                  </Flex>
                  <Flex
                    shadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                    fontSize={"14px"}
                    flexDir={"column"}
                    w={"100%"}
                  >
                    <Flex
                      bg={"#F8F9FA"}
                      w={"100%"}
                      color={"#848484"}
                      fontSize={"14px"}
                      borderBottom={"1px solid #bababa"}
                      // shadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                    >
                      <Flex
                        borderRight={"#E2E8F0 1px solid"}
                        px={"10px"}
                        py={"5px"}
                        minW={"30px"}
                      >
                        No
                      </Flex>
                      <Flex
                        borderRight={"#E2E8F0 1px solid"}
                        px={"10px"}
                        py={"5px"}
                        flex={1}
                      >
                        Inspection Form
                      </Flex>
                      <Flex px={"10px"} py={"5px"} flex={1}>
                        {" "}
                        Category
                      </Flex>
                    </Flex>
                    {selectedMachine?.selectedInspectionForms?.length ? (
                      <Flex
                        flexDir={"column"}
                        bg={"white"}
                        // pb={"50px"}
                        minH={"100px"}
                      >
                        {selectedMachine?.selectedInspectionForms?.map(
                          (
                            selectedInspectionForm,
                            selectedInspectionFormIndex
                          ) => {
                            return (
                              <Flex
                                key={selectedInspectionFormIndex} // Ensure to use key when rendering a list
                                bg={
                                  selectedInspectionFormIndex % 2 === 0
                                    ? "#FFFFFF"
                                    : "#F8F9FA"
                                }
                                w={"100%"}
                                color={"#333"}
                                fontSize={"14px"}
                                borderBottom={"#bababa solid 1px"}
                                // shadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                              >
                                <Flex
                                  borderRight={"#E2E8F0 1px solid"}
                                  px={"10px"}
                                  py={"5px"}
                                  w={"3%"}
                                  minW={"30px"}
                                >
                                  {selectedInspectionFormIndex + 1}
                                </Flex>
                                <Flex
                                  borderRight={"#E2E8F0 1px solid"}
                                  px={"10px"}
                                  py={"5px"}
                                  w={"52%"}
                                >
                                  {selectedInspectionForm.label}
                                </Flex>
                                <Flex px={"10px"} py={"5px"} w={"45%"}>
                                  {selectedInspectionForm.categoryName}
                                </Flex>
                              </Flex>
                            );
                          }
                        )}
                      </Flex>
                    ) : (
                      <Flex
                        w={"100%"}
                        justifyContent={"center"}
                        py={"30px"}
                        // boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                        flexDir={"column"}
                        alignItems={"center"}
                      >
                        <Flex color={"#dc143c"} fontWeight={700}>
                          No inspection forms are selected!
                        </Flex>
                        <Flex color={"#848484"}>
                          Please choose an inspection form from the list.
                        </Flex>
                      </Flex>
                    )}
                  </Flex>
                </Flex>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Td>
      </Tr>
    </>
  );
}
