import {
  Center,
  Divider,
  Flex,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import WorkOrderDetailsAssociation from "../../components/WorkOrders/WorkOrderDetailsAssociations";
import WorkOrderDetailsHeader from "../../components/WorkOrders/WorkOrderDetailsHeader";
import WorkOrderDetailsAuditLog from "../../components/WorkOrders/WorkOrderDetailsAuditLog";
import Pagination from "../../components/Pagination";
import ListEmptyState from "../../components/ListEmptyState";
import { useState } from "react";
import SwitchRequestDetailModal from "../../components/SwitchRequest/SwitchRequestDetailModal";
export default function WorkOrderDetailsAuditLogPage({
  workOrder,
  from,
  rows,
  setRows,
  auditLogs,
  totalPages,
  showing,
  currentAuditLogPage,
  setCurrentAuditLogPage,
  auditLogLoading,
  hasManagePermission,
  handleOpenSendReminder,
}) {
  const switchRequestDetailDisclosure = useDisclosure();
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedSwitchRequest, setSelectedSwitchRequest] = useState(false);
  const handleChange = (e) => {
    const { value, id } = e.target;
    setRows(value);
  };
  function handleOpenSwitchRequestDetailModal(switchRequest) {
    switchRequestDetailDisclosure.onOpen();
    setSelectedSwitchRequest(switchRequest);
  }
  return (
    <Flex p={"30px"}>
      <Flex
        p={"20px"}
        w={"100%"}
        boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
        bg={"#f8f9fa"}
        gap={"20px"}
      >
        <Flex
          flexGrow={1}
          gap={"20px"}
          flexDir={"column"}
          alignItems={"center"}
        >
          <WorkOrderDetailsHeader workOrder={workOrder} />
          <Flex
            minH={"800px"}
            w={"100%"}
            px={"20px"}
            py={"20px"}
            bg={"white"}
            boxShadow={"0px 0px 3px rgba(50,50,93,0.5)"}
          >
            <Flex w={"100%"} flexDir={"column"} gap={"20px"}>
              <Flex flexDir={"column"} gap={"20px"}>
                <Flex justifyContent={"space-between"} alignItems={"center"}>
                  <Flex fontSize={"20px"} fontWeight={700} color={"#dc143c"}>
                    Audit Logs
                  </Flex>
                </Flex>
                {auditLogLoading ? (
                  <Center
                    flexDir={"column"}
                    alignItems={"center"}
                    gap={"20px"}
                    height="500px"
                    opacity={1}
                  >
                    <Spinner thickness="4px" size="xl" color="#dc143c" />
                    <Center
                      flexDir={"column"}
                      color={"#dc143c"}
                      fontWeight={700}
                    >
                      <Flex fontWeight={700} fontSize={"20px"}>
                        Loading
                      </Flex>
                      <Flex color={"black"}>Processing your request...</Flex>
                    </Center>
                  </Center>
                ) : (
                  <Flex
                    flexDir={"column"}
                    gap={"15px"}
                    w={"100%"}
                    justify={"center"}
                  >
                    {auditLogs.length ? (
                      auditLogs.map((val, index) => (
                        <>
                          {index === 0 && (
                            <Divider borderColor={"#848484"} m={0} />
                          )}
                          <WorkOrderDetailsAuditLog
                            from={from}
                            index={index}
                            val={val}
                            handleOpenSwitchRequestDetailModal={
                              handleOpenSwitchRequestDetailModal
                            }
                          />
                          <Divider borderColor={"#848484"} m={0} />
                        </>
                      ))
                    ) : (
                      <ListEmptyState
                        isTable={false}
                        header1={"No audit logs found."}
                        header2={"to begin tracking them."}
                        linkText={"Update the work order"}
                      />
                    )}
                  </Flex>
                )}
                <Pagination
                  setCurrentPage={setCurrentAuditLogPage}
                  totalPages={totalPages}
                  currentPage={currentAuditLogPage}
                  from={from}
                  rows={rows}
                  handleChange={handleChange}
                  showing={showing}
                />
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <WorkOrderDetailsAssociation
          handleOpenSendReminder={handleOpenSendReminder}
          workOrder={workOrder}
          hasManagePermission={hasManagePermission}
        />
      </Flex>
      <SwitchRequestDetailModal
        selectedSwitchRequest={selectedSwitchRequest}
        onClose={switchRequestDetailDisclosure.onClose}
        isOpen={switchRequestDetailDisclosure.isOpen}
      />
    </Flex>
  );
}
