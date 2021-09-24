import React, {useEffect, useState} from "react";
import "mdbreact/dist/css/mdb.css";
import {
    MDBBox,
    MDBBtn,
    MDBCard,
    MDBCardBody,
    MDBCardText,
    MDBCardTitle,
    MDBCol,
    MDBContainer,
    MDBRow,
} from "mdbreact";
import {Select, Button, Dropdown, Menu, TreeSelect, Modal, Progress} from "antd";
import {getInstance} from "d2";
import Header from "@dhis2/d2-ui-header-bar"
import {DownOutlined} from "@ant-design/icons";

const fuzz = require("fuzzball");
const basicAuth = "Basic " + btoa("ahmed:Atwabi@20");
const eventsUrl = `https://covmw.com/namistest/api/events`
const instanceUrl = `https://covmw.com/namistest/api/trackedEntityInstances`
const enrolUrl = `https://covmw.com/namistest/api/enrollments`
const MainForm = (props) => {

    var orgUnitFilters = ["Filter By", "Markets"];

    const [showLoading, setShowLoading] = useState(false);
    const [orgUnits, setOrgUnits] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [searchValue, setSearchValue] = useState();
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [orgFilter, setOrgFilter] = useState(orgUnitFilters[0]);
    const [choseFilter, setChoseFilter] = useState(false);
    const [treeMarkets, setTreeMarkets] = useState(null);
    const [treeValue, setTreeValue] = useState();
    const [flattenedUnits, setFlattenedUnits] = useState([]);
    const [D2, setD2] = useState();
    const [modal, setModal] = useState();
    const [alertModal, setAlertModal] = useState(false);
    const [status, setStatus] = useState(0);
    const [statusText, setStatusText] = useState("normal");
    const [messageText, setMessageText] = useState("Found no instances to transfer");
    //const [trackedInstances, setTrackedInstances] = useState([]);

    const handleCancel = () => {
        setAlertModal(false);
    };

    getInstance().then(d2 =>{
        setD2(d2);
    });

    useEffect(() => {
        setOrgUnits(props.organizationalUnits);
        setPrograms(props.programs);
        setTreeMarkets(props.treeMarkets);

    },[props.organizationalUnits, props.programs, props.d2, props.marketOrgUnits, props.treeMarkets]);

    const handle = (value, label, extra) => {
        setSearchValue(value)
    };

    const onSelect = (value, node) => {
        //setSelectedOrgUnit(node);
        console.log(node);

        var children = extractChildren(node)
        var tempArray = [];
        if(children === undefined){
            tempArray.push(node);
            setFlattenedUnits(tempArray)
        } else {
            let flat = flatten(extractChildren(node), extractChildren, node.level, node.parent)
                .map(x => delete x.children && x);
            //console.log(flat)
            setFlattenedUnits(flat);
        }
    };

    let extractChildren = x => x.children;
    let flatten = (children, getChildren, level, parent) => Array.prototype.concat.apply(
        children && children.map(x => ({ ...x, level: level || 1, parent: parent || null })),
        children && children.map(x => flatten(getChildren(x) || [], getChildren, (level || 1) + 1, x.id))
    );

    const handleTree = (value, label, extra) => {
        setTreeValue(value)
    };

    const onSelectTree = (value, node) => {
        //setOrgUnit(selectedOrgUnit => [...selectedOrgUnit, node]);
        //setSelectedOrgUnit(node);     vbn
        var children = extractChildren(node);

        if(children === undefined){
            setFlattenedUnits([node]);
        } else {
            let flat = flatten(extractChildren(node), extractChildren, node.level, node.parent)
                .map(x => delete x.children && x);
            //console.log(flat)
            setFlattenedUnits(flat);
        }
    };

    const handleProgram = selectedOption => {
        console.log(selectedOption);
        setSelectedProgram(selectedOption);
    };

    const handleOrgFilter = (value) => {
        setOrgFilter(value);
        if(value === "Markets"){
            setChoseFilter(true);
            setFlattenedUnits([]);
            //setSelectedOrgUnit(null)
            setSearchValue(null);
            setTreeValue(null);
        } else {
            setChoseFilter(false);
            setFlattenedUnits([]);
            //setSelectedOrgUnit(null)
            setSearchValue(null);
            setTreeValue(null);
        }
    }


    const orgUnitMenu = (
        <Menu>
            {orgUnitFilters.map((item, index) => (
                <Menu.Item key={index} onClick={()=>{handleOrgFilter(item)}}>
                    {item}
                </Menu.Item>
            ))}
        </Menu>
    );

    var trackedInstances = [];

    const handleTransfer = () => {

        setStatusText("normal");
        setShowLoading(true);
        setMessageText("Looking trackedEntityInstances....");
        setAlertModal(true);
        setStatus(10);
        var progID = selectedProgram;

        var number = 0;
        console.log(flattenedUnits);
        flattenedUnits.map((unit, index) => {
            //if(index === flattenedUnits.length - 1){
                //console.log("last but one")
            //}

        number = ((index+1)/flattenedUnits.length) * 100;

        const endpoint = `trackedEntityInstances.json?ou=${unit.id}&program=${progID}&fields=*`;
        D2.Api.getApi().get(endpoint)
            .then((response) => {
                console.log(response.trackedEntityInstances);
                if(response.trackedEntityInstances.length === 0){
                    //console.log(message);
                    //setMessageText("Found no instances to transfer");
                    setMessageText("Found no trackedEntityInstances  to transfer")
                    setStatusText("exception");
                    setShowLoading(false);
                } else {
                    //setException(false);
                    setTimeout(() => {
                        setMessageText("Found " +response.trackedEntityInstances.length+" instances. Finding duplicate instances.....")
                    }, 1000);

                }

                trackedInstances = response.trackedEntityInstances;

                for(var x = trackedInstances.length-1; x >= 0; x--){
                    var name2 = trackedInstances[x].attributes[0].value;
                    var instance2ID = trackedInstances[x].trackedEntityInstance;
                    //console.log(name2);
                    for(var y = 0; y < trackedInstances.length; y++){
                        var name = trackedInstances[y].attributes[0].value;
                        var instanceID = trackedInstances[y].trackedEntityInstance;
                        //console.log(name);
                        if(name === name2 && instance2ID !== instanceID){

                            if(trackedInstances[x] !== undefined){
                                trackedInstances[y].enrollments = [...trackedInstances[y].enrollments, ...trackedInstances[x].enrollments];
                                console.log(trackedInstances[y].enrollments);
                                trackedInstances.splice(x, 1);

                                setTimeout(() => {
                                    setMessageText("Found duplicates... Merging...");
                                }, 1000);

                            }

                        } else {
                            setTimeout(() => {
                                setMessageText("No duplicate instances found");
                            }, 2000);


                        }
                    }
                }
                console.log(trackedInstances);

                setTimeout(() => {
                    setStatus(40);
                    setMessageText("Posting instances, enrollments and events");
                }, 3000);

                trackedInstances.map((temp) => {
                    console.log(temp.attributes[0].value, temp.attributes[1].value)
                });


                var enrolmentArray = [];
                var eventsArray = [];

                trackedInstances.map((instance) => {
                    enrolmentArray = enrolmentArray.concat([...instance.enrollments]);
                    instance.enrollments.map((enrol) => {
                        eventsArray = eventsArray.concat([...enrol.events]);
                    });

                    fetch(instanceUrl, {
                        method: 'POST',
                        body: JSON.stringify(instance),
                        headers: {
                            'Authorization' : basicAuth,
                            'Content-type': 'application/json',
                        },
                        credentials: "include"

                    })
                        .then(response => {
                            console.log(response);

                            if(response.status === 200 || response.status === 201){
                                console.log("posted instances");
                                setTimeout(() => {
                                    setStatus(60);
                                    setStatusText("normal");
                                    setMessageText("Posting trackedEntityInstances...");
                                }, 2000);
                                //setMessageText("Successfully posted trackedEntityInstances.");
                                //
                                setShowLoading(false);

                                var rounded = Math.round(number * 10) / 10
                                setStatus(rounded);

                                enrolmentArray.map((enrol) => {
                                    fetch(enrolUrl, {
                                        method: 'POST',
                                        body: JSON.stringify(enrol),
                                        headers: {
                                            'Authorization' : basicAuth,
                                            'Content-type': 'application/json',
                                        },
                                        credentials: "include"

                                    })
                                        .then(response => {
                                            console.log(response);

                                            if(response.status === 200 || response.status === 201){
                                                console.log("posted enrolments");
                                                setTimeout(() => {
                                                    setStatus(85);
                                                    setStatusText("normal");
                                                    setMessageText("Posting enrollments...");
                                                }, 2000);

                                                eventsArray.map((event) => {
                                                    setTimeout(() => {
                                                        setStatus(99);
                                                        setStatusText("normal");
                                                        setMessageText("Posting event...");
                                                        //setStatusText("success");
                                                    }, 1000);
                                                    fetch(eventsUrl, {
                                                        method: 'POST',
                                                        body: JSON.stringify(event),
                                                        headers: {
                                                            'Authorization' : basicAuth,
                                                            'Content-type': 'application/json',
                                                        },
                                                        credentials: "include"

                                                    })
                                                        .then(response => {
                                                            console.log(response);

                                                            if(response.status === 200 || response.status === 201){
                                                                console.log("posted events");
                                                                setTimeout(() => {
                                                                    //setStatus(99);
                                                                    setMessageText("Posted events!");
                                                                    setStatusText("success");
                                                                }, 1000);

                                                            } else {
                                                                setMessageText("Failed to post event due to an error");
                                                                setStatusText("exception");
                                                            }
                                                        })
                                                        .catch((error) => {
                                                            console.log("Failed to post events");
                                                            setMessageText("Failed to post events due to an error");
                                                            setStatusText("exception");
                                                        });
                                                });
                                            } else {
                                                console.log("Failed to post enrolments");
                                            }
                                        })
                                        .catch((error) => {
                                            console.log("Failed to post enrolments");
                                            setMessageText("Failed to post enrolment due to an error");
                                            setStatusText("exception");
                                        });
                                });


                            } else {
                                console.log("Failed to post instances");
                                setMessageText("Failed to post instance due to an error");
                                setStatusText("exception");
                            }
                        })
                        .catch((error) => {
                            setModal("Failed to post instances due to an error : " + error.message);
                            console.log("Failed to post instances");
                        });
                });

            });
        })
    }


    return (
        <div>
            {D2 && <Header className="mb-5" d2={D2}/>}
            <MDBBox className="mt-5" display="flex" justifyContent="center" >
                <MDBCol className="mb-5 mt-5" md="10">
                    <MDBCard display="flex" justifyContent="center" className="text-xl-center w-100">
                        <MDBCardBody>
                            <MDBCardTitle>
                                <strong>Events Transfer</strong>
                            </MDBCardTitle>

                            <MDBCardText>
                                <strong>Select Program and Org Unit(s)</strong>
                            </MDBCardText>

                            {programs.length == 0 ? <div className="spinner-border mx-2 indigo-text spinner-border-sm" role="status">
                                <span className="sr-only">Loading...</span>
                            </div> : null}

                            <hr/>

                            <Modal title="Alert" visible={alertModal} onOk={()=>{}} onCancel={()=>{handleCancel()}}>
                                <div className="d-flex flex-column w-100 align-items-center">
                                    <MDBCardText>
                                        {messageText}

                                    </MDBCardText>
                                    {showLoading ? <div className="spinner-border mx-2 text-white spinner-border text-center" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div> : null}
                                    <Progress type="circle" percent={status} status={statusText}/>
                                </div>

                            </Modal>

                            <MDBContainer className="pl-5 mt-3">
                                <MDBRow>
                                    <MDBCol>
                                        <div className="text-left my-3 d-flex flex-column">
                                            <label className="grey-text ml-2">
                                                <strong>Select Program</strong>
                                            </label>
                                            <Select placeholder="select program option"
                                                    style={{ width: '100%' }}
                                                    size="large"
                                                    className="mt-2"
                                                    showSearch
                                                    optionFilterProp="children"
                                                    filterOption={(input, option) =>
                                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                    }
                                                    filterSort={(optionA, optionB) =>
                                                        optionA.children.toLowerCase().localeCompare(optionB.children.toLowerCase())
                                                    }
                                                    onChange={handleProgram}>
                                                {programs.map((item, index) => (
                                                    <Select.Option key={index} value={item.id}>{item.label}</Select.Option>
                                                ))}

                                            </Select>

                                        </div>
                                    </MDBCol>
                                    <MDBCol>

                                        <div className="text-left my-3">
                                            <label className="grey-text ml-2">
                                                <strong>Select Organization Unit</strong>
                                                    <Dropdown overlay={orgUnitMenu} className="ml-3">
                                                        <Button size="small">{orgFilter} <DownOutlined /></Button>
                                                    </Dropdown>
                                            </label>

                                            {choseFilter ?
                                                <TreeSelect
                                                    style={{ width: '100%' }}
                                                    value={treeValue}
                                                    className="mt-2"
                                                    dropdownStyle={{ maxHeight: 400, overflow: 'auto'}}
                                                    treeData={treeMarkets}
                                                    allowClear
                                                    size="large"
                                                    placeholder="Please select organizational unit"
                                                    onChange={handleTree}
                                                    onSelect={onSelectTree}
                                                    showSearch={true}
                                                />
                                                :
                                                <TreeSelect
                                                    style={{ width: '100%' }}
                                                    value={searchValue}
                                                    className="mt-2"
                                                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                                    treeData={orgUnits}
                                                    allowClear
                                                    size="large"
                                                    placeholder="Please select organizational unit"
                                                    onChange={handle}
                                                    onSelect={onSelect}
                                                    showSearch={true}
                                                />

                                            }

                                        </div>
                                    </MDBCol>
                                </MDBRow>

                            </MDBContainer>

                            <div className="text-center py-4 mt-2">

                                <MDBBtn color="mdb-color" rounded className="text-white" onClick={() => {
                                    handleTransfer();
                                }}>
                                    transfer
                                </MDBBtn>
                            </div>

                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBBox>
        </div>
    )
}

export default MainForm;