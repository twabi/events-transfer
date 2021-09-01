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
import {Select, Button, Dropdown, Menu, TreeSelect, Modal, Spin, Progress} from "antd";
import {getInstance} from "d2";
import Header from "@dhis2/d2-ui-header-bar"
import {DownOutlined} from "@ant-design/icons";


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
    const [modal, setModal] = useState(false);
    const [alertModal, setAlertModal] = useState(false);
    const [status, setStatus] = useState(0);

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
        //console.log(value);
    };

    const onSelectTree = (value, node) => {
        //setOrgUnit(selectedOrgUnit => [...selectedOrgUnit, node]);
        //setSelectedOrgUnit(node);
        console.log(node);

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

    const handleTransfer = () => {

        setAlertModal(true);
        var progID = selectedProgram;
        console.log(flattenedUnits)
        console.log(progID);

        var number = 0;
        flattenedUnits.map((unit, index) => {

            number = ((index+1)/flattenedUnits.length) * 100;
            var rounded = Math.round(number * 10) / 10
            setStatus(rounded);
            //if(index === flattenedUnits.length - 1){
                //console.log("last but one")
            //}
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
                                        {status === 100 ? <strong>Successfully transferred events</strong> : <strong>transferring events...</strong>}
                                    </MDBCardText>
                                    <Progress type="circle" percent={status} />
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
                                    transfer{showLoading ? <div className="spinner-border mx-2 text-white spinner-border-sm" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div> : null}
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