import React from "react";
import {Form, Input, Button, Checkbox, Card, Modal} from 'antd';
import {withBaseUrl} from "./index";

var url = "https://covmw.com/maintest/"
var secret = "96a3fc120-3d1f-0eb1-a2ce-02cb67fe7e4";
var clientID = "events-transfer-111";
const LoginModal = () => {
    const [visible, setVisible] = React.useState(true);

    const onFinish = (values) => {
        //console.log('Success:', values);

        var username = values.username;
        var password = values.password;


        const basicAuth = "Basic " + btoa(username +":"+password);

        fetch(url+"api/programs", {
            method: 'GET',
            headers: {
                'Authorization' : basicAuth,
                'Content-type': 'application/json',
            },
            credentials: "include"

        }).then((response) => {
            console.log(response);
            if(response.status === 200){
                withBaseUrl(url+"api", basicAuth);
            }
        }).catch((error) =>{
            console.log(error);
        });
        /*
        fetch(url+"uaa/oauth/token/", {
            body: `grant_type=password&username=${username}&password=${password}&scope=ALL`,
            headers: {
                Accept: "application/json",
                Authorization: "Basic ZXZlbnRzLXRyYW5zZmVyLTExMTo5NmEzZmMxMjAtM2QxZi0wZWIxLWEyY2UtMDJjYjY3ZmU3ZTQ=",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            method: "POST",
            mode: "cors"
        }).then((response) => {
            console.log(response);
            if(response.status === 200){
                //withBaseUrl(url+"api");
            }
        }).catch((error) =>{
            console.log(error);
        });



        /*
        fetch(url+"uaa/oauth/token", {
            method: 'POST',
                headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            mode:"cors",
            body: `client_id=${clientID}&client_secret=${secret}&grant_type=password&username=${username}&password=${password}`
        })
    .then(res => res.json())
            .then(token => console.log(token))
            .catch(err => console.error(err));


         */
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <>
            <Modal visible={visible} footer={false} title={"Login to Server : " + url}>
                <div className="w-100 h-100 d-flex justify-content-center align-items-center">
                    <>
                        <Form
                            name="basic"
                            initialValues={{ remember: true }}
                            onFinish={onFinish}
                            onFinishFailed={onFinishFailed}
                            autoComplete="off"
                        >
                            <Form.Item
                                label="Username"
                                name="username"
                                className="mt-2"
                                rules={[{ required: true, message: 'Please input your username!' }]}
                            >
                                <Input id="username"/>
                            </Form.Item>

                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[{ required: true, message: 'Please input your password!' }]}
                            >
                                <Input.Password id="password"/>
                            </Form.Item>

                            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                <Button type="primary" htmlType="submit">
                                    Submit
                                </Button>
                            </Form.Item>
                        </Form>
                    </>

                </div>
            </Modal>
        </>
    );
}

export default LoginModal;