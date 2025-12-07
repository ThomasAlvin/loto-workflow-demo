import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Checkbox,
  Flex,
  Image,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import moment from "moment";
import { FaChevronDown } from "react-icons/fa6";

import { IoIosLock } from "react-icons/io";
import { TbLineScan } from "react-icons/tb";
import formatString from "../../utils/formatString";
import getLockImageByModel from "../../utils/getLockImageByModel";
import ResponseTypeMapper from "../../components/ResponseTypeMapper";
import tableStatusStyleMapper from "../../utils/tableStatusStyleMapper";
import ListEmptyState from "../ListEmptyState";
import MemberGroupList from "../MemberGroupList";
import ReportDetailsStepInspectionForm from "./ReportDetailsStepInspectionForm";
export default function ReportDetailsStepSubmissions({ selectedStep }) {
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  const multiLockAccessNames =
    selectedStep?.report_multi_lock_group?.report_multi_lock_group_items.map(
      (item) => item.name
    ) || [];

  const lockAccessIds =
    selectedStep?.report_locks?.map((item) => item.name) || [];

  const multiLockAccessAuditLogs =
    selectedStep.report_step_audit_trails?.filter((log) => {
      return multiLockAccessNames.includes(log.lock?.name);
    });

  const lockAccessAuditLogs = selectedStep.report_step_audit_trails?.filter(
    (log) => {
      return lockAccessIds.includes(log.lock?.name);
    }
  );

  return (
    <Flex flexDir={"column"} gap={"30px"}>
      {selectedStep?.report_step_submissions.length ? (
        selectedStep?.report_step_submissions?.map(
          (reportSubmission, submissionIndex) => {
            return (
              <Flex flexDir={"column"} gap={"20px"}>
                <Flex flexDir={"column"} px={"20px"}>
                  <Flex
                    flexDir={"column"}
                    gap={"10px"}
                    pb={"8px"}
                    borderBottom={"3px dashed #dc143c"}
                  >
                    <Flex
                      color={"#dc143c"}
                      // bg={"#dc143c"}
                      fontSize={"20px"}
                      fontWeight={700}
                      textAlign="left"
                    >
                      Submission - {submissionIndex + 1}
                    </Flex>
                  </Flex>
                </Flex>
                <Flex px={"20px"} w={"100%"} flexDir={"column"} gap={"20px"}>
                  <Flex w={"100%"} flexDir={"column"} gap={"5px"}>
                    <Flex gap={"20px"} justifyContent={"space-between"}>
                      <Flex fontWeight={700}>Submitted by :</Flex>
                    </Flex>
                    <MemberGroupList
                      memberArray={[reportSubmission?.action_by_report_user]}
                      isReport={true}
                      hasShowMore={false}
                    />
                  </Flex>
                  <Flex flexDir={"column"}>
                    <Flex gap={"20px"} justifyContent={"space-between"}>
                      <Flex fontWeight={700}>Completion Time:</Flex>
                    </Flex>
                    <Flex>
                      {moment(reportSubmission.finished_at).format(
                        "MMMM Do YYYY, hh:mm A"
                      )}
                    </Flex>
                  </Flex>
                  {selectedStep.form ? (
                    <FormSection
                      selectedStep={selectedStep}
                      submissionIndex={submissionIndex}
                    />
                  ) : (
                    ""
                  )}
                  {selectedStep.notify ? (
                    <NotifySection
                      selectedStep={selectedStep}
                      submissionIndex={submissionIndex}
                      notifyAt={reportSubmission.notify_at}
                    />
                  ) : (
                    ""
                  )}
                  {selectedStep.machine ? (
                    <MachineSection
                      selectedStep={selectedStep}
                      submissionIndex={submissionIndex}
                    />
                  ) : (
                    ""
                  )}
                  {selectedStep.access_lock ? (
                    <LockAccessSection
                      selectedStep={selectedStep}
                      submissionIndex={submissionIndex}
                    />
                  ) : (
                    ""
                  )}
                  {selectedStep.multi_access_lock ? (
                    <MultiLockAccessSection
                      selectedStep={selectedStep}
                      submissionIndex={submissionIndex}
                      multiLockAccessAuditLogs={multiLockAccessAuditLogs}
                    />
                  ) : (
                    ""
                  )}
                  {selectedStep.condition ? (
                    <ConditionSection
                      selectedStep={selectedStep}
                      responseConditional={
                        reportSubmission.response_conditional
                      }
                      submissionIndex={submissionIndex}
                    />
                  ) : (
                    ""
                  )}
                  {selectedStep.trigger_api ? (
                    <TriggerApiSection
                      selectedStep={selectedStep}
                      submissionIndex={submissionIndex}
                    />
                  ) : (
                    ""
                  )}
                </Flex>
              </Flex>
            );
          }
        )
      ) : (
        <Flex px={"20px"} w={"100%"} flexDir={"column"} gap={"20px"}>
          {selectedStep.form ? <FormSection selectedStep={selectedStep} /> : ""}
          {selectedStep.notify ? (
            <NotifySection selectedStep={selectedStep} />
          ) : (
            ""
          )}
          {selectedStep.machine ? (
            <MachineSection selectedStep={selectedStep} />
          ) : (
            ""
          )}
          {selectedStep.access_lock ? (
            <LockAccessSection selectedStep={selectedStep} />
          ) : (
            ""
          )}
          {selectedStep.multi_access_lock ? (
            <MultiLockAccessSection
              selectedStep={selectedStep}
              multiLockAccessAuditLogs={multiLockAccessAuditLogs}
            />
          ) : (
            ""
          )}
          {selectedStep.condition ? (
            <ConditionSection selectedStep={selectedStep} />
          ) : (
            ""
          )}
          {selectedStep.trigger_api ? (
            <TriggerApiSection selectedStep={selectedStep} />
          ) : (
            ""
          )}
        </Flex>
      )}
    </Flex>
  );
}
function FormSection({ selectedStep, submissionIndex }) {
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  return (
    <Flex flexDir={"column"} gap={"16px"}>
      <Flex flexDir={"column"}>
        <Flex
          pb={"8px"}
          color={"#dc143c"}
          borderBottom={"2px solid #dc143c"}
          fontSize={"18px"}
          fontWeight={700}
          textAlign="left"
        >
          Form
        </Flex>
      </Flex>
      <Flex w={"100%"}>
        <Flex w={"100%"} flexDir={"column"} gap={"10px"}>
          <Flex
            fontSize={"16px"}
            flexDir={"column"}
            w={"100%"}
            gap={"10px"}
            pl={"0px"}
          >
            {selectedStep.report_form_questions?.map((val, index) => {
              return (
                <Flex w={"100%"} flexDir={"column"}>
                  <Flex alignItems={"center"} gap={"10px"} color={"#dc143c"}>
                    <Flex fontWeight={700}>{index + 1}.</Flex>
                    <Flex color={"black"} fontWeight={700}>
                      {val.question}
                    </Flex>
                  </Flex>

                  <Flex pl={"24px"} color={val.response ? "black" : "#848484"}>
                    <ResponseTypeMapper
                      type={val.question_type}
                      include_date={val.include_date}
                      include_time={val.include_time}
                      submissions={val?.submissions}
                      submissionIndex={submissionIndex}
                      options={val.options}
                      format={val.format}
                      unit={val.unit}
                    />
                  </Flex>
                </Flex>
              );
            })}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
function NotifySection({ selectedStep, submissionIndex, notifyAt }) {
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  return (
    <Flex w={"100%"} flexDir={"column"} gap={"16px"}>
      <Flex flexDir={"column"}>
        <Flex
          pb={"8px"}
          color={"#dc143c"}
          borderBottom={"2px solid #dc143c"}
          fontSize={"18px"}
          fontWeight={700}
          textAlign="left"
        >
          Notify
        </Flex>
      </Flex>
      <Flex w={"100%"}>
        <Flex w={"100%"} flexDir={"column"} gap={"10px"}>
          <Flex w={"100%"} flexDir={"column"} gap={"5px"}>
            <Flex gap={"20px"} justifyContent={"space-between"}>
              <Flex alignItems={"center"} gap={"10px"} fontWeight={700}>
                <Flex
                  w={"12px"}
                  h={"12px"}
                  borderRadius={"20px"}
                  bg={"#dc143c"}
                ></Flex>
                <Flex>Notified to :</Flex>
              </Flex>
            </Flex>
            <Box w={"100%"}>
              <MemberGroupList
                memberArray={selectedStep?.report_step_notified_members?.map(
                  (assignedMember) => ({
                    ...assignedMember,
                    user: {
                      first_name: assignedMember.first_name,
                      last_name: assignedMember.last_name,
                      profile_image_url: assignedMember.profile_image_url,
                    },
                  })
                )}
                hasShowMore={false}
              />
            </Box>
          </Flex>
          <Flex flexDir={"column"}>
            <Flex alignItems={"center"} gap={"10px"} fontWeight={700}>
              <Flex
                w={"12px"}
                h={"12px"}
                borderRadius={"20px"}
                bg={"#dc143c"}
              ></Flex>
              <Flex>Notification Message :</Flex>
            </Flex>
            <Flex pl={"22px"}>
              <Flex flexDir={"column"} fontSize={"16px"}>
                <Flex>{selectedStep.notification_message}</Flex>
              </Flex>
            </Flex>
          </Flex>
          {notifyAt ? (
            <Flex flexDir={"column"}>
              <Flex alignItems={"center"} gap={"10px"} fontWeight={700}>
                <Flex
                  w={"12px"}
                  h={"12px"}
                  borderRadius={"20px"}
                  bg={"#dc143c"}
                ></Flex>
                <Flex>Notified at :</Flex>
              </Flex>
              <Flex pl={"22px"}>
                <Flex flexDir={"column"} fontSize={"16px"}>
                  <Flex>
                    {" "}
                    {moment(notifyAt).format("MMMM Do YYYY, hh:mm A")}
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          ) : (
            ""
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}
function MachineSection({ selectedStep, submissionIndex }) {
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  return (
    <Flex flexDir={"column"} gap={"16px"}>
      <Flex
        pb={"8px"}
        color={"#dc143c"}
        borderBottom={"2px solid #dc143c"}
        fontSize={"18px"}
        fontWeight={700}
        textAlign="left"
      >
        Assigned Machines
      </Flex>
      <TableContainer
        overflowX={"hidden"}
        boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
      >
        <Table w={"100%"} variant="simple">
          <Thead>
            <Tr bg={"#ECEFF3"}>
              <Th borderBottomColor={"#bababa"} px={"12px"}>
                No
              </Th>
              <Th borderBottomColor={"#bababa"} px={"12px"}>
                Machine
              </Th>
              <Th borderBottomColor={"#bababa"} px={"12px"}>
                Machine ID
              </Th>
              <Th borderBottomColor={"#bababa"} px={"12px"}>
                Model
              </Th>
              <Th borderBottomColor={"#bababa"} px={"12px"}>
                Serial Number
              </Th>
              <Th borderBottomColor={"#bababa"} px={"12px"}></Th>
            </Tr>
          </Thead>
          <Tbody>
            {selectedStep.report_step_machines.map((val, index) => {
              return (
                <>
                  <Tr
                    cursor={"pointer"}
                    bg={"#f9f9f9"}
                    _hover={{
                      background: "#ededed",
                    }}
                    transition={"background ease-in-out 0.1s"}
                  >
                    <Td
                      borderBottomColor={"#bababa"}
                      fontWeight={700}
                      px={"12px"}
                    >
                      {index + 1}.
                    </Td>
                    <Td
                      borderBottomColor={"#bababa"}
                      whiteSpace={"normal"}
                      px={"12px"}
                    >
                      {val.name}
                    </Td>
                    <Td
                      borderBottomColor={"#bababa"}
                      whiteSpace={"normal"}
                      px={"12px"}
                    >
                      {val.custom_machine_id}
                    </Td>
                    <Td
                      borderBottomColor={"#bababa"}
                      whiteSpace={"normal"}
                      px={"12px"}
                    >
                      {val.model}
                    </Td>

                    <Td
                      borderBottomColor={"#bababa"}
                      whiteSpace={"normal"}
                      px={"12px"}
                    >
                      {val.serial_number || "-"}
                    </Td>
                    <Td borderBottomColor={"#bababa"} px={"12px"}>
                      <FaChevronDown />
                    </Td>
                  </Tr>
                  <Tr>
                    <Td
                      borderX={"1px solid #EDF2F7"}
                      colSpan={6}
                      p={0}
                      whiteSpace={"normal"}
                    >
                      <Accordion index={[0]} allowToggle>
                        <AccordionItem>
                          <AccordionButton
                            display={"none"}
                            p={0}
                          ></AccordionButton>
                          <AccordionPanel p={"20px"}>
                            <Flex flexDir={"column"} gap={"10px"}>
                              <Flex alignItems={"center"} gap={"10px"}>
                                <Flex fontWeight={700}>Inspection Form :</Flex>
                              </Flex>
                              {val?.selected_inspection_forms?.length ? (
                                <Flex flexDir={"column"}>
                                  {val.selected_inspection_forms.map(
                                    (inspectionForm, index) => (
                                      <ReportDetailsStepInspectionForm
                                        index={index}
                                        submissionIndex={submissionIndex}
                                        inspectionForm={inspectionForm}
                                      />
                                    )
                                  )}
                                </Flex>
                              ) : (
                                <Flex
                                  w={"100%"}
                                  justifyContent={"center"}
                                  py={"40px"}
                                  boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                                  flexDir={"column"}
                                  alignItems={"center"}
                                >
                                  <Flex color={"#dc143c"} fontWeight={700}>
                                    No questions was assigned!
                                  </Flex>
                                  <Flex color={"#848484"}>
                                    There was no assigned inspection questions
                                    for this machine!
                                  </Flex>
                                </Flex>
                              )}
                            </Flex>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    </Td>
                  </Tr>
                </>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>

      <Flex gap={"10px"}>
        <Checkbox
          bg={"white"}
          borderColor={"#039be5"}
          isChecked={selectedStep?.require_verify_machine}
          isDisabled
          size="lg"
        ></Checkbox>
        <Flex
          // fontSize={"14px"}
          color={selectedStep?.require_verify_machine ? "#3182CE" : "black"}
          alignItems={"center"}
          gap={"5px"}
        >
          <Flex
            fontWeight={700}
            // color={"black"}
          >
            Enable machine UID/QR verification
          </Flex>
          <Flex fontSize={"20px"}>
            <TbLineScan />
          </Flex>
        </Flex>
      </Flex>
      <Flex flexDir={"column"} gap={"5px"}>
        <Flex fontWeight={700} textAlign="left">
          Machine QR/UID Verified By
        </Flex>
        <Box
          w={"100%"}
          onClick={() => {
            console.log(selectedStep);
          }}
        >
          <MemberGroupList
            memberArray={selectedStep?.report_step_notified_members?.map(
              (assignedMember) => ({
                ...assignedMember,
                user: {
                  first_name: assignedMember.first_name,
                  last_name: assignedMember.last_name,
                  profile_image_url: assignedMember.profile_image_url,
                },
              })
            )}
            hasShowMore={false}
          />
        </Box>
      </Flex>
    </Flex>
  );
}
function LockAccessSection({ selectedStep, submissionIndex }) {
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  return (
    <Flex flexDir={"column"}>
      <Flex flexDir={"column"} gap={"20px"}>
        <Flex
          py={"4px"}
          px={"10px"}
          bg={
            selectedStep?.status === "completed" ||
            selectedStep?.status === "cancelled"
              ? "#dc143c"
              : "#bababa"
          }
          color={"white"}
          fontSize={"20px"}
          fontWeight={700}
          textAlign="left"
        >
          Assigned Lock
        </Flex>
        <Flex flexDir={"column"}>
          <TableContainer
            overflowX={"hidden"}
            boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
          >
            <Table w={"100%"} variant="simple">
              <Thead bg={"#ECEFF3"}>
                <Tr>
                  <Th
                    textAlign={"center"}
                    borderBottomColor={"#bababa"}
                    px={"12px"}
                    w={"60px"}
                  >
                    No
                  </Th>
                  <Th borderBottomColor={"#bababa"} px={"12px"}>
                    Lock
                  </Th>
                  <Th borderBottomColor={"#bababa"} px={"12px"}>
                    Serial Number
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {selectedStep.report_locks.map((val, index) => {
                  return (
                    <Tr
                      cursor={"pointer"}
                      bg={index % 2 ? "white" : "#f8f9fa"}
                      fontSize={"14px"}
                      _hover={{
                        background: "#ededed",
                      }}
                      transition={"background ease-in-out 0.1s"}
                    >
                      <Td
                        fontWeight={700}
                        px={"12px"}
                        textAlign={"center"}
                        borderBottomColor={"#bababa"}
                      >
                        {index + 1}.
                      </Td>
                      <Td
                        borderBottomColor={"#bababa"}
                        whiteSpace={"normal"}
                        px={"12px"}
                      >
                        <Flex alignItems={"center"} gap={"10px"}>
                          <Flex
                            bg={"#dedede"}
                            justifyContent={"center"}
                            alignItems={"center"}
                            h={"48px"}
                            w={"48px"}
                          >
                            <Flex color={"white"} fontSize={"20px"}>
                              {val.model ? (
                                <Image src={getLockImageByModel(val.model)} />
                              ) : (
                                <IoIosLock />
                              )}
                            </Flex>
                          </Flex>
                          <Flex flexDir={"column"}>
                            <Flex fontWeight={700}>{val.name}</Flex>
                            <Flex
                              fontWeight={400}
                              fontSize={"14px"}
                              color={"#848484"}
                            >
                              {val.model}
                            </Flex>
                          </Flex>
                        </Flex>
                      </Td>
                      <Td
                        borderBottomColor={"#bababa"}
                        whiteSpace={"normal"}
                        color={"#848484"}
                        px={"12px"}
                      >
                        {val.serial_number}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        </Flex>
        {selectedStep.report_locks.length ? (
          <Flex flexDir={"column"} gap={"10px"}>
            <Flex fontWeight={700}>Submitted Images : </Flex>
            <Flex gap={"20px"} flexDir={"column"}>
              <Flex flexDir={"column"} gap={"10px"}>
                {selectedStep.report_locks.map((lock) => (
                  <>
                    <Flex fontWeight={700} color={"#dc143c"} fontSize={"14px"}>
                      {lock.name}
                    </Flex>
                    <Flex gap={"20px"} flexWrap={"wrap"}>
                      {lock.response_image_url &&
                      lock.response_image_url.length ? (
                        lock.response_image_url.map((responseURL) => (
                          <Flex>
                            <Flex cursor={"pointer"} position={"relative"}>
                              <Image
                                w={"120px"}
                                bg={"#f5f5f5"}
                                h={"100px"}
                                boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
                                src={IMGURL + responseURL}
                              ></Image>
                            </Flex>
                          </Flex>
                        ))
                      ) : (
                        <Flex fontSize={"14px"} color={"#848484"}>
                          No Image Submitted
                        </Flex>
                      )}
                    </Flex>
                  </>
                ))}
              </Flex>
            </Flex>
          </Flex>
        ) : (
          ""
        )}
        <Flex flexDir={"column"} gap={"10px"}>
          <Box
            fontWeight={700}
            as="span"
            flex="1"
            textAlign="left"
            alignItems={"center"}
          >
            Lock Access Audit Logs :
          </Box>
          <Flex flexDir={"column"} gap={"10px"}>
            <TableContainer
              overflow={"auto"}
              boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
            >
              <Table variant="simple">
                <Thead bg={"#ECEFF3"}>
                  <Tr>
                    <Th borderBottomColor={"#bababa"} px={"12px"}>
                      Lock
                    </Th>
                    <Th borderBottomColor={"#bababa"} px={"12px"}>
                      Date & Time
                    </Th>
                    <Th borderBottomColor={"#bababa"} px={"12px"}>
                      Action
                    </Th>
                    <Th borderBottomColor={"#bababa"} px={"12px"}>
                      Method
                    </Th>
                    <Th borderBottomColor={"#bababa"} px={"12px"}>
                      Method Info
                    </Th>

                    <Th borderBottomColor={"#bababa"} px={"12px"}>
                      Location
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {lockAccessAuditLogs.length ? (
                    lockAccessAuditLogs.map((val, index) => {
                      const { bgColor, textColor, icon, text } =
                        tableStatusStyleMapper(val.status);
                      return (
                        <Tr
                          onClick={() => {}}
                          w={"100%"}
                          bg={index % 2 ? "white" : "#f8f9fa"}
                        >
                          <Td
                            borderBottomColor={"#bababa"}
                            whiteSpace="normal"
                            wordBreak="break-word"
                            px={"12px"}
                            fontSize={"14px"}
                          >
                            <Flex alignItems={"center"} gap={"10px"}>
                              <Flex
                                bg={"#dedede"}
                                justifyContent={"center"}
                                alignItems={"center"}
                                h={"48px"}
                                w={"48px"}
                              >
                                <Flex color={"white"} fontSize={"20px"}>
                                  {val.report_lock.model ? (
                                    <Image
                                      src={getLockImageByModel(
                                        val.report_lock.model
                                      )}
                                    />
                                  ) : (
                                    <IoIosLock />
                                  )}
                                </Flex>
                              </Flex>
                              <Flex flexDir={"column"}>
                                <Flex fontWeight={700}>
                                  {val.report_lock.name}
                                </Flex>
                                <Flex
                                  fontWeight={400}
                                  fontSize={"14px"}
                                  color={"#848484"}
                                >
                                  {val.report_lock.model}
                                </Flex>
                              </Flex>
                            </Flex>
                          </Td>
                          <Td
                            px={"12px"}
                            borderBottomColor={"#bababa"}
                            color={"#848484"}
                            overflowWrap="break-word"
                            maxWidth="50px"
                            whiteSpace="normal"
                            fontSize={"14px"}
                          >
                            <Flex flexDir={"column"}>
                              <Flex color={"black"} fontWeight={700}>
                                {moment(val.time).format("YYYY-MM-DD")}
                              </Flex>
                              <Flex color={"#848484"} fontSize={"14px"}>
                                {moment(val.time).format("hh:mm A")}
                              </Flex>
                            </Flex>
                          </Td>
                          <Td
                            borderBottomColor={"#bababa"}
                            fontSize={"14px"}
                            px={"12px"}
                          >
                            <Flex>
                              <Flex
                                fontWeight={700}
                                borderRadius={"10px"}
                                px={"8px"}
                                py={"4px"}
                                alignItems={"center"}
                                gap={"8px"}
                                bg={bgColor}
                                color={textColor}
                              >
                                <Flex fontSize={"20px"}>{icon}</Flex>
                                <Flex>{text}</Flex>
                              </Flex>
                            </Flex>
                          </Td>
                          <Td
                            px={"12px"}
                            borderBottomColor={"#bababa"}
                            color={"#848484"}
                            overflowWrap="break-word"
                            maxWidth="50px"
                            whiteSpace="normal"
                            fontSize={"14px"}
                          >
                            <Flex color={"#848484"} fontSize={"14px"}>
                              {formatString(val.method)}
                            </Flex>
                          </Td>
                          <Td
                            px={"12px"}
                            borderBottomColor={"#bababa"}
                            color={"#848484"}
                            overflowWrap="break-word"
                            maxWidth="50px"
                            whiteSpace="normal"
                            fontSize={"14px"}
                          >
                            <Flex color={"#848484"} fontSize={"14px"}>
                              {formatString(val.method_info)}
                            </Flex>
                          </Td>
                          <Td
                            borderBottomColor={"#bababa"}
                            color={"#848484"}
                            whiteSpace="normal"
                            wordBreak="break-word"
                            px={"12px"}
                            fontSize={"14px"}
                          >
                            <Flex>{val.placemark || "-"}</Flex>
                          </Td>
                        </Tr>
                      );
                    })
                  ) : (
                    <ListEmptyState
                      size={"sm"}
                      colSpan={6}
                      header1={"No history found."}
                      header2={"to begin tracking them."}
                      linkText={"Create an action"}
                    />
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
function MultiLockAccessSection({
  selectedStep,
  submissionIndex,
  multiLockAccessAuditLogs,
}) {
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  return (
    <Flex flexDir={"column"} gap={"20px"}>
      <Flex flexDir={"column"} gap={"16px"}>
        <Flex
          pb={"8px"}
          color={"#dc143c"}
          borderBottom={"2px solid #dc143c"}
          fontSize={"18px"}
          fontWeight={700}
          textAlign="left"
        >
          Assigned Locks
        </Flex>
        <Flex gap={"10px"} alignItems={"center"}>
          <Flex fontWeight={700} alignItems={"center"}>
            Lock Access&nbsp;
            {selectedStep.report_multi_lock_group.name +
              (selectedStep.multi_access_lock_step_index > 0
                ? selectedStep.multi_access_lock_step_index
                : "")}
            &nbsp;
            <Box as="span" fontSize={"14px"} color={"#848484"}>
              (
              {
                selectedStep.report_multi_lock_group.report_multi_lock_group_items.filter(
                  (groupItems) => groupItems.report_stepId === selectedStep.id
                ).length
              }{" "}
              Locks Selected)&nbsp;
            </Box>
            :
          </Flex>
        </Flex>
        <Flex flexDir={"column"}>
          <TableContainer
            overflowX={"hidden"}
            boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
          >
            <Table w={"100%"} variant="simple">
              <Thead bg={"#ECEFF3"}>
                <Tr>
                  <Th
                    textAlign={"center"}
                    borderBottomColor={"#bababa"}
                    px={"12px"}
                    w={"60px"}
                  >
                    No
                  </Th>
                  <Th borderBottomColor={"#bababa"} px={"12px"}>
                    Lock
                  </Th>
                  <Th borderBottomColor={"#bababa"} px={"12px"}>
                    Serial Number
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {selectedStep.report_multi_lock_group
                  .report_multi_lock_group_items.length ? (
                  selectedStep.report_multi_lock_group.report_multi_lock_group_items
                    .filter(
                      (groupItems) =>
                        groupItems.report_stepId === selectedStep.id
                    )
                    .map((val, index) => {
                      return (
                        <Tr
                          cursor={"pointer"}
                          bg={index % 2 ? "white" : "#f8f9fa"}
                          fontSize={"14px"}
                          _hover={{
                            background: "#ededed",
                          }}
                          transition={"background ease-in-out 0.1s"}
                        >
                          <Td
                            borderBottomColor={"#bababa"}
                            textAlign={"center"}
                            fontWeight={700}
                            px={"12px"}
                          >
                            {index + 1}.
                          </Td>
                          <Td
                            borderBottomColor={"#bababa"}
                            fontWeight={700}
                            whiteSpace={"normal"}
                            px={"12px"}
                          >
                            <Flex alignItems={"center"} gap={"10px"}>
                              <Flex
                                bg={"#dedede"}
                                justifyContent={"center"}
                                alignItems={"center"}
                                h={"48px"}
                                w={"48px"}
                              >
                                <Flex color={"white"} fontSize={"20px"}>
                                  {val.report_lock.model ? (
                                    <Image
                                      src={getLockImageByModel(
                                        val.report_lock.model
                                      )}
                                    />
                                  ) : (
                                    <IoIosLock />
                                  )}
                                </Flex>
                              </Flex>
                              <Flex flexDir={"column"}>
                                <Flex fontWeight={700}>
                                  {val.report_lock.name}
                                </Flex>
                                <Flex
                                  fontWeight={400}
                                  fontSize={"14px"}
                                  color={"#848484"}
                                >
                                  {val.report_lock.model}
                                </Flex>
                              </Flex>
                            </Flex>
                          </Td>

                          <Td
                            borderBottomColor={"#bababa"}
                            whiteSpace={"normal"}
                            px={"12px"}
                            color={"#848484"}
                          >
                            {val.report_lock.serial_number}
                          </Td>
                        </Tr>
                      );
                    })
                ) : (
                  <ListEmptyState
                    size={"sm"}
                    colSpan={6}
                    header1={"No Locks found."}
                    header2={"No lock have been selected."}
                    linkText={"Create an action"}
                  />
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </Flex>
      </Flex>
      {selectedStep?.report_multi_lock_group.report_multi_lock_group_items
        .length ? (
        <Flex flexDir={"column"} gap={"10px"}>
          <Flex fontWeight={700}>Submitted Images : </Flex>
          <Flex gap={"10px"} flexDir={"column"}>
            {selectedStep?.report_multi_lock_group.report_multi_lock_group_items
              .filter(
                (groupItems) => groupItems.report_stepId === selectedStep.id
              )
              .map((multiLock) => (
                <Flex flexDir={"column"} gap={"10px"}>
                  <Flex fontWeight={700} color={"#dc143c"} fontSize={"14px"}>
                    {multiLock.report_lock.name}
                  </Flex>
                  {multiLock.report_multi_lock_group_item_responses.filter(
                    (itemResponses) =>
                      itemResponses.report_stepId === selectedStep.id
                  ).length ? (
                    multiLock.report_multi_lock_group_item_responses
                      .filter(
                        (itemResponses) =>
                          itemResponses.report_stepId === selectedStep.id
                      )
                      .map((responseImageURL) => (
                        <>
                          <Flex gap={"20px"} flexWrap={"wrap"}>
                            {responseImageURL?.submissions[submissionIndex]
                              ?.response.length ? (
                              responseImageURL?.submissions[
                                submissionIndex
                              ]?.response?.map((responseURL) => (
                                <Flex>
                                  <Flex
                                    cursor={"pointer"}
                                    position={"relative"}
                                  >
                                    <Image
                                      w={"120px"}
                                      bg={"#f5f5f5"}
                                      h={"100px"}
                                      boxShadow={
                                        "0px 0px 3px rgba(50,50,93,0.5)"
                                      }
                                      src={IMGURL + responseURL}
                                    ></Image>
                                  </Flex>
                                </Flex>
                              ))
                            ) : (
                              <Flex color={"#848484"} fontSize={"14px"}>
                                No image submitted
                              </Flex>
                            )}
                          </Flex>
                        </>
                      ))
                  ) : (
                    <Flex color={"#848484"} fontSize={"14px"}>
                      No image submitted
                    </Flex>
                  )}
                </Flex>
              ))}
          </Flex>
        </Flex>
      ) : (
        ""
      )}

      <Flex flexDir={"column"} gap={"10px"}>
        <Box
          fontWeight={700}
          as="span"
          flex="1"
          textAlign="left"
          alignItems={"center"}
        >
          Lock Access Audit Logs :
        </Box>
        <Flex flexDir={"column"} gap={"10px"}>
          <TableContainer
            overflow={"auto"}
            boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
          >
            <Table variant="simple">
              <Thead bg={"#ECEFF3"}>
                <Tr>
                  <Th borderBottomColor={"#bababa"} px={"12px"}>
                    Lock
                  </Th>
                  <Th borderBottomColor={"#bababa"} px={"12px"}>
                    Date & Time
                  </Th>
                  <Th borderBottomColor={"#bababa"} px={"12px"}>
                    Action
                  </Th>
                  <Th borderBottomColor={"#bababa"} px={"12px"}>
                    Method
                  </Th>
                  <Th borderBottomColor={"#bababa"} px={"12px"}>
                    Method Info
                  </Th>
                  <Th borderBottomColor={"#bababa"} px={"12px"}>
                    Location
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {multiLockAccessAuditLogs.length ? (
                  multiLockAccessAuditLogs.map((val, index) => {
                    const { bgColor, textColor, icon, text } =
                      tableStatusStyleMapper(val.status);
                    return (
                      <Tr
                        onClick={() => {}}
                        w={"100%"}
                        bg={index % 2 ? "white" : "#f8f9fa"}
                      >
                        <Td
                          borderBottomColor={"#bababa"}
                          whiteSpace="normal"
                          wordBreak="break-word"
                          px={"12px"}
                          fontSize={"14px"}
                        >
                          <Flex alignItems={"center"} gap={"10px"}>
                            <Flex
                              bg={"#dedede"}
                              justifyContent={"center"}
                              alignItems={"center"}
                              h={"48px"}
                              w={"48px"}
                            >
                              <Flex color={"white"} fontSize={"20px"}>
                                {val.report_lock.model ? (
                                  <Image
                                    src={getLockImageByModel(
                                      val.report_lock.model
                                    )}
                                  />
                                ) : (
                                  <IoIosLock />
                                )}
                              </Flex>
                            </Flex>
                            <Flex flexDir={"column"}>
                              <Flex fontWeight={700}>
                                {val.report_lock.name}
                              </Flex>
                              <Flex
                                fontWeight={400}
                                fontSize={"14px"}
                                color={"#848484"}
                              >
                                {val.report_lock.serial_number}
                              </Flex>
                            </Flex>
                          </Flex>
                        </Td>
                        <Td
                          px={"12px"}
                          borderBottomColor={"#bababa"}
                          color={"#848484"}
                          overflowWrap="break-word"
                          maxWidth="50px"
                          whiteSpace="normal"
                          fontSize={"14px"}
                        >
                          <Flex flexDir={"column"}>
                            <Flex
                              whiteSpace={"nowrap"}
                              color={"black"}
                              fontWeight={700}
                            >
                              {moment(val.time).format("YYYY-MM-DD")}
                            </Flex>
                            <Flex
                              whiteSpace={"nowrap"}
                              color={"#848484"}
                              fontSize={"14px"}
                            >
                              {moment(val.time).format("hh:mm A")}
                            </Flex>
                          </Flex>
                        </Td>
                        <Td
                          borderBottomColor={"#bababa"}
                          fontSize={"14px"}
                          px={"12px"}
                        >
                          <Flex>
                            <Flex
                              fontWeight={700}
                              borderRadius={"10px"}
                              px={"8px"}
                              py={"4px"}
                              alignItems={"center"}
                              gap={"8px"}
                              bg={bgColor}
                              color={textColor}
                            >
                              <Flex fontSize={"20px"}>{icon}</Flex>
                              <Flex>{text}</Flex>
                            </Flex>
                          </Flex>
                        </Td>
                        <Td
                          px={"12px"}
                          borderBottomColor={"#bababa"}
                          color={"#848484"}
                          overflowWrap="break-word"
                          maxWidth="50px"
                          whiteSpace="normal"
                          fontSize={"14px"}
                        >
                          <Flex color={"#848484"} fontSize={"14px"}>
                            {formatString(val.method)}
                          </Flex>
                        </Td>
                        <Td
                          px={"12px"}
                          borderBottomColor={"#bababa"}
                          color={"#848484"}
                          overflowWrap="break-word"
                          maxWidth="50px"
                          whiteSpace="normal"
                          fontSize={"14px"}
                        >
                          <Flex color={"#848484"} fontSize={"14px"}>
                            {formatString(val.method_info)}
                          </Flex>
                        </Td>
                        <Td
                          borderBottomColor={"#bababa"}
                          color={"#848484"}
                          whiteSpace="normal"
                          wordBreak="break-word"
                          px={"12px"}
                          fontSize={"14px"}
                        >
                          <Flex>{val.placemark || "-"}</Flex>
                        </Td>
                      </Tr>
                    );
                  })
                ) : (
                  <ListEmptyState
                    size={"sm"}
                    colSpan={6}
                    header1={"No history found."}
                    header2={
                      "No actions have been taken on the assigned locks."
                    }
                    linkText={"Create an action"}
                  />
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </Flex>
      </Flex>
    </Flex>
  );
}
function ConditionSection({
  selectedStep,
  responseConditional,
  submissionIndex,
}) {
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  return (
    <Flex w={"100%"} flexDir={"column"} gap={"16px"}>
      <Flex flexDir={"column"}>
        <Flex
          pb={"8px"}
          color={"#dc143c"}
          borderBottom={"2px solid #dc143c"}
          fontSize={"18px"}
          fontWeight={700}
          textAlign="left"
        >
          Condition
        </Flex>
      </Flex>
      <Flex w={"100%"}>
        <Flex w={"100%"} flexDir={"column"} gap={"10px"}>
          <Flex w={"100%"} flexDir={"column"} gap={"5px"}>
            <Flex gap={"20px"} justifyContent={"space-between"}>
              <Flex alignItems={"center"} gap={"10px"} fontWeight={700}>
                <Flex
                  w={"12px"}
                  h={"12px"}
                  borderRadius={"20px"}
                  bg={"#dc143c"}
                ></Flex>
                <Flex>Condition Question :</Flex>
              </Flex>
            </Flex>
            <Flex pl={"22px"}>
              <Flex flexDir={"column"} fontSize={"16px"}>
                <Flex>{selectedStep.condition_question}</Flex>
              </Flex>
            </Flex>
          </Flex>
          {responseConditional ? (
            <Flex flexDir={"column"}>
              <Flex alignItems={"center"} gap={"10px"} fontWeight={700}>
                <Flex
                  w={"12px"}
                  h={"12px"}
                  borderRadius={"20px"}
                  bg={"#dc143c"}
                ></Flex>
                <Flex>Selected Option :</Flex>
              </Flex>
              <Flex pl={"22px"}>
                <Flex flexDir={"column"} fontSize={"16px"}>
                  <Flex>{responseConditional}</Flex>
                </Flex>
              </Flex>
            </Flex>
          ) : (
            ""
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}
function TriggerApiSection({ selectedStep, submissionIndex }) {
  const IMGURL = import.meta.env.VITE_API_IMAGE_URL;
  return (
    <Flex flexDir={"column"}>
      <Box fontWeight={700} as="span" flex="1" textAlign="left">
        Trigger API external system key :
      </Box>
      <Flex color={selectedStep.title_trigger_api ? "black" : "#848484"}>
        {selectedStep.title_trigger_api}
      </Flex>
    </Flex>
  );
}
