import { Box, Flex, Input, Select, Textarea } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import ReactSelect from "react-select";
import { FaPlus, FaTriangleExclamation } from "react-icons/fa6";
import { api } from "../../api/api";
import CreatableSelect from "react-select/creatable";
import QRCodeGenerator from "../LockInventory/QRCodeGenerator";
import CustomSelectionSelect from "../CustomSelectionSelect";

function CreateEquipmentMachinePageRightSide({
  isEdit,
  formik,
  options,
  setOptions,
  inputHandler,
  machineInput,
  setMachineInput,
  selectionLoading,
}) {
  function categorySelectHandler(event) {
    const tempObject = {
      ...machineInput,
      category: event,
    };
    setMachineInput(tempObject);
    formik.setValues(tempObject);
  }
  function createCategoryHandler(newOption) {
    const newOptionObj = {
      label: newOption,
      value: newOption,
      newCategory: true,
    };
    setOptions((prevOptions) => [...prevOptions, newOptionObj]);
    const updatedCategory = [...machineInput.category, newOptionObj];
    const tempObject = { ...machineInput, category: updatedCategory };
    setMachineInput(tempObject);
    formik.setValues(tempObject);
  }
  return (
    <Flex w={"60%"} h={"100%"}>
      <Flex flexDir={"column"} w={"100%"} gap={"0px"}>
        <Flex h={"40px"}></Flex>
        <Flex position={"relative"} pb={"20px"} flexDir={"column"}>
          <Flex flexDir={"column"}>
            <Box fontWeight={700} as="span" flex="1" textAlign="left">
              Equipment/Machine Name&nbsp;
              <Box as="span" color={"#dc143c"}>
                *
              </Box>
            </Box>
            <Flex
              textAlign={"center"}
              fontSize={"14px"}
              color={"#848484"}
              justifyContent={"space-between"}
            >
              <Flex>Give your Equipment/Machine a short and clear name</Flex>
            </Flex>
          </Flex>
          <Flex>
            <Input
              placeholder="Diesel Power Generator"
              border={
                formik.errors.name && formik.touched.name
                  ? "1px solid crimson"
                  : "1px solid #E2E8F0"
              }
              onBlur={formik.handleBlur}
              onChange={(e) => {
                inputHandler(e);
              }}
              value={machineInput.name}
              id="name"
            ></Input>
          </Flex>
          {formik.errors.name && formik.touched.name ? (
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
              <Flex>{formik.errors.name}</Flex>
            </Flex>
          ) : (
            ""
          )}
        </Flex>

        <Flex position={"relative"} pb={"20px"} flexDir={"column"}>
          <Flex flexDir={"column"}>
            <Box fontWeight={700} as="span" flex="1" textAlign="left">
              Description (
              <Box as="span" color={"#848484"}>
                Optional
              </Box>
              )
            </Box>
            <Flex
              textAlign={"center"}
              fontSize={"14px"}
              color={"#848484"}
              justifyContent={"space-between"}
            >
              <Flex>Give your Equipment/Machine a description</Flex>
            </Flex>
          </Flex>
          <Flex>
            <Textarea
              placeholder="This diesel generator is a critical part of our operations, providing backup power during outages and ensuring continuous productivity."
              value={machineInput.description}
              onChange={inputHandler}
              id="description"
            />
          </Flex>
        </Flex>
        <Flex position={"relative"} pb={"20px"} flexDir={"column"}>
          <Flex flexDir={"column"}>
            <Box fontWeight={700} as="span" flex="1" textAlign="left">
              Machine ID&nbsp;
              <Box as="span" color={"#dc143c"}>
                *
              </Box>
            </Box>
            <Flex
              textAlign={"center"}
              fontSize={"14px"}
              color={"#848484"}
              justifyContent={"space-between"}
            >
              <Flex>Enter the machine ID for the equipment/machine</Flex>
            </Flex>
          </Flex>
          <Flex>
            <Input
              placeholder="Machine-001"
              border={
                formik.errors.machineId && formik.touched.machineId
                  ? "1px solid crimson"
                  : "1px solid #E2E8F0"
              }
              onBlur={formik.handleBlur}
              onChange={inputHandler}
              value={machineInput.machineId}
              id="machineId"
            ></Input>
          </Flex>
          {formik.errors.machineId && formik.touched.machineId ? (
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
              <Flex>{formik.errors.machineId}</Flex>
            </Flex>
          ) : (
            ""
          )}
        </Flex>
        <Flex position={"relative"} pb={"20px"} flexDir={"column"}>
          <Flex flexDir={"column"}>
            <Box fontWeight={700} as="span" flex="1" textAlign="left">
              Serial Number (
              <Box as="span" color={"#848484"}>
                Optional
              </Box>
              )
            </Box>
            <Flex
              textAlign={"center"}
              fontSize={"14px"}
              color={"#848484"}
              justifyContent={"space-between"}
            >
              <Flex>Enter the serial number for the equipment/machine</Flex>
            </Flex>
          </Flex>
          <Flex>
            <Input
              placeholder="GEN-2024-D500-015678"
              border={
                formik.errors.serialNumber && formik.touched.serialNumber
                  ? "1px solid crimson"
                  : "1px solid #E2E8F0"
              }
              onBlur={formik.handleBlur}
              onChange={inputHandler}
              value={machineInput.serialNumber}
              id="serialNumber"
            ></Input>
          </Flex>
          {formik.errors.serialNumber && formik.touched.serialNumber ? (
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
              <Flex>{formik.errors.serialNumber}</Flex>
            </Flex>
          ) : (
            ""
          )}
        </Flex>
        <Flex position={"relative"} pb={"20px"} flexDir={"column"}>
          <Flex flexDir={"column"}>
            <Box fontWeight={700} as="span" flex="1" textAlign="left">
              Model&nbsp;
              <Box as="span" color={"#dc143c"}>
                *
              </Box>
            </Box>
            <Flex
              textAlign={"center"}
              fontSize={"14px"}
              color={"#848484"}
              justifyContent={"space-between"}
            >
              <Flex>Enter the model for the equipment/machine</Flex>
            </Flex>
          </Flex>
          <Flex>
            <Input
              placeholder="D5000E-XT"
              border={
                formik.errors.model && formik.touched.model
                  ? "1px solid crimson"
                  : "1px solid #E2E8F0"
              }
              onBlur={formik.handleBlur}
              onChange={inputHandler}
              value={machineInput.model}
              id="model"
            ></Input>
          </Flex>
          {formik.errors.model && formik.touched.model ? (
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
              <Flex>{formik.errors.model}</Flex>
            </Flex>
          ) : (
            ""
          )}
        </Flex>
        <Flex position={"relative"} pb={"20px"} flexDir={"column"}>
          <Flex flexDir={"column"}>
            <Box fontWeight={700} as="span" flex="1" textAlign="left">
              Location&nbsp;
              <Box as="span" color={"#dc143c"}>
                *
              </Box>
            </Box>
            <Flex
              textAlign={"center"}
              fontSize={"14px"}
              color={"#848484"}
              justifyContent={"space-between"}
            >
              <Flex>Enter the location for the equipment/machine</Flex>
            </Flex>
          </Flex>
          <Flex>
            <Input
              placeholder="United States"
              border={
                formik.errors.location && formik.touched.location
                  ? "1px solid crimson"
                  : "1px solid #E2E8F0"
              }
              onBlur={formik.handleBlur}
              onChange={inputHandler}
              value={machineInput.location}
              id="location"
            ></Input>
          </Flex>
          {formik.errors.location && formik.touched.location ? (
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
              <Flex>{formik.errors.location}</Flex>
            </Flex>
          ) : (
            ""
          )}
        </Flex>
        <Flex position={"relative"} pb={"20px"} flexDir={"column"}>
          <Flex flexDir={"column"}>
            <Box fontWeight={700} as="span" flex="1" textAlign="left">
              Category&nbsp;
              <Box as="span" color={"#dc143c"}>
                *
              </Box>
            </Box>
            <Flex
              textAlign={"center"}
              fontSize={"14px"}
              color={"#848484"}
              justifyContent={"space-between"}
            >
              <Flex>Enter the category of you're equipment/machine</Flex>
            </Flex>
          </Flex>
          <CustomSelectionSelect
            title={"category"}
            isLoading={selectionLoading}
            selection={options}
            selectHandler={categorySelectHandler}
            selectedOption={machineInput?.category}
            createNewOption={createCategoryHandler}
            onBlur={() => {
              formik.setFieldTouched("category", true);
            }}
            border={
              formik.errors.category && formik.touched.category
                ? "1px solid #dc143c"
                : ""
            }
          />
          {/* <Flex flexDir={"column"}>
            <CreatableSelect
              createOptionPosition="first"
              options={options}
              onBlur={() => {
                formik.setFieldTouched("category", true);
              }}
              value={machineInput.category}
              onCreateOption={createCategoryHandler}
              onChange={categorySelectHandler}
              formatCreateLabel={(inputValue) => (
                <Flex gap={"8px"} color={"#2684FF"} alignItems={"center"}>
                  <FaPlus />
                  <Flex>Create "{inputValue}" as new Category</Flex>
                </Flex>
              )}
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  borderColor:
                    formik.touched.category && formik.errors.category
                      ? "crimson"
                      : state.isFocused
                      ? "blue"
                      : "#E2E8F0",
                  boxShadow: state.isFocused ? "0 0 0 1px blue" : "none",
                }),
              }}
              placeholder="Search or Add New Category"
              isSearchable
              isMulti
            />
          </Flex> */}
          {formik.errors.category && formik.touched.category ? (
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
              <Flex>{formik.errors.category}</Flex>
            </Flex>
          ) : (
            ""
          )}
        </Flex>
        <Flex position={"relative"} pb={"20px"} flexDir={"column"}>
          <Flex flexDir={"column"}>
            <Box fontWeight={700} as="span" flex="1" textAlign="left">
              Status&nbsp;
              <Box as="span" color={"#dc143c"}>
                *
              </Box>
            </Box>
            <Flex
              textAlign={"center"}
              fontSize={"14px"}
              color={"#848484"}
              justifyContent={"space-between"}
            >
              <Flex>Enter the status of you're equipment/machine</Flex>
            </Flex>
          </Flex>
          <Flex>
            <Select
              border={
                formik.errors.status && formik.touched.status
                  ? "1px solid crimson"
                  : "1px solid #E2E8F0"
              }
              onBlur={formik.handleBlur}
              onChange={inputHandler}
              value={machineInput.status}
              id="status"
            >
              <option value={""} display="none" disabled selected hidden>
                Select Status{" "}
              </option>
              <option value={"out_of_order"}>Out of Order</option>
              <option value={"operational"}>Operational</option>
              <option value={"under_maintenance"}>Under Maintenance</option>
              <option value={"idle"}>Idle</option>
              <option value={"ongoing_inspection"}>Ongoing Inspection</option>
              <option value={"decommissioned"}>Decommissioned</option>
            </Select>
          </Flex>
          {formik.errors.status && formik.touched.status ? (
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
              <Flex>{formik.errors.status}</Flex>
            </Flex>
          ) : (
            ""
          )}
        </Flex>
        <Flex position={"relative"} pb={"20px"} flexDir={"column"}>
          <Flex flexDir={"column"}>
            <Box fontWeight={700} as="span" flex="1" textAlign="left">
              Additional Notes (
              <Box as="span" color={"#848484"}>
                Optional
              </Box>
              )
            </Box>
            <Flex
              textAlign={"center"}
              fontSize={"14px"}
              color={"#848484"}
              justifyContent={"space-between"}
            >
              <Flex>Enter any additional notes for the equipment/machine</Flex>
            </Flex>
          </Flex>
          <Flex>
            <Textarea
              placeholder="Always perform a pre-start check, ensuring fuel levels, oil levels, and battery charge are adequate."
              border={"1px solid #E2E8F0"}
              onBlur={formik.handleBlur}
              onChange={inputHandler}
              value={machineInput.additionalNotes}
              id="additionalNotes"
            ></Textarea>
          </Flex>
        </Flex>
        {isEdit ? (
          <Flex flexDir={"column"}>
            <Flex flexDir={"column"}>
              <Box fontWeight={700} as="span" flex="1" textAlign="left">
                QR code
              </Box>
              <Flex
                textAlign={"center"}
                fontSize={"14px"}
                color={"#848484"}
                justifyContent={"space-between"}
              >
                <Flex>A QR code that encodes the equipment/machine's UID.</Flex>
              </Flex>
            </Flex>
            <Flex gap={"20px"} flexDir={"column"}>
              <QRCodeGenerator
                QRCodeValue={machineInput.UID}
                QrCodeFileName={machineInput.name}
              />
            </Flex>
          </Flex>
        ) : (
          ""
        )}
      </Flex>
    </Flex>
  );
}

export default CreateEquipmentMachinePageRightSide;
