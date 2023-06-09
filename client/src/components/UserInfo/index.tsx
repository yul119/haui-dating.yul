import React, { useEffect, useState } from "react";
import { Button, Form, message, Steps, theme } from "antd";
import BasicInfo from "./BasicInfo";
import Hobbies from "./Hobbies";
import ChooseImg from "./ChooseImg";
import Setting from "./Setting";
import { useAppDispatch } from "../../hook/useAppDispatch";
import { callApiGetAllHobby } from "../../reducer/hobby.reducer";
import {
  IUserInformationRequest,
  IUpdateUserInformationRequest,
} from "../../interface/User";
import dayjs from "dayjs";
import {
  callApiPostUserInformation,
  callApiUpdateUserInformation,
} from "../../reducer/user.reducer";
import { useAppSelector } from "../../hook/useAppSelector";
import { useNavigate } from "react-router-dom";
import { callApiGetInfo } from "../../reducer/auth.reducer";

const Info = ({ className }: { className?: string }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.authReducer.user);
  const [isUpdate] = useState(user?.profile ? true : false);
  const navigate = useNavigate();
  const [formRef] = Form.useForm();
  const [location, setLocation] = useState({
    latitude: 0,
    longitude: 0,
  });

  const getLocation = async () => {
    await navigator.geolocation.getCurrentPosition(
      (position) =>
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      (err) => console.log(err)
    );
  };

  useEffect(() => {
    dispatch(callApiGetAllHobby());
    getLocation();
    const fullName = user?.profile?.fullName?.split(" ") || [];
    const lastName = fullName?.pop();
    formRef.setFieldsValue({
      lastName: lastName || "",
      firstName: fullName.join(" ") || "",
      bio: user?.profile?.bio || "",
      ...(isUpdate && {
        birthday: dayjs(user?.profile?.birthday, "YYYY/MM/DD") || "",
      }),
      hobbies: user?.userHobbies?.map((el) => el.hobby.id) || [],
      gender: user?.profile?.gender || "male",
      images: [],
      settingDistance: user?.settings?.distance || [0, 100],
      settingGender: user?.settings?.gender || "female",
      settingOld: user?.settings?.old || [18, 38],
    });
  }, [dispatch, formRef, user, isUpdate]);

  const steps = [
    {
      title: "Basic Info",
      content: <BasicInfo />,
    },
    {
      title: "Hobbies",
      content: <Hobbies formRef={formRef} />,
    },
    {
      title: "Choose your picture",
      content: <ChooseImg formRef={formRef} />,
    },
    {
      title: "Settings",
      content: <Setting />,
    },
  ];
  const { token } = theme.useToken();
  const [current, setCurrent] = useState<number>(0);

  const next = () => {
    const data = formRef.getFieldsValue();
    if (
      (data.firstName &&
        data.lastName &&
        data.gender &&
        data.birthday &&
        data.bio &&
        current === 0) ||
      (data.hobbies.length > 0 && current === 1) ||
      current === 2
    )
      setCurrent(current + 1);
    else message.error("Please complete all information.");
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const items = steps.map((item) => ({ key: item.title, title: item.title }));

  const contentStyle: React.CSSProperties = {
    lineHeight: "500px",
    textAlign: "center",
    color: token.colorTextTertiary,
    backgroundColor: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: `1px dashed ${token.colorBorder}`,
    marginTop: 16,
  };

  const handleSubmit = (value: any) => {
    const data: IUserInformationRequest = {
      profile: {
        fullName: value.firstName + " " + value.lastName,
        gender: value.gender,
        birthday: dayjs(value.birthday).format("YYYY/MM/DD"),
        bio: value.bio,
        reputational: 10,
        latitude: location.latitude,
        longitude: location.longitude,
      },
      hobbies: value.hobbies,
      images: value.images,
      settings: {
        distance: value.settingDistance,
        gender: value.settingGender,
        old: value.settingOld,
      },
    };
    if (isUpdate) {
      const dataUpdate: IUpdateUserInformationRequest = {
        profile: {
          fullName: value.firstName + " " + value.lastName,
          gender: value.gender,
          birthday: dayjs(value.birthday).format("YYYY/MM/DD"),
          bio: value.bio,
          reputational: 10,
          latitude: location.latitude,
          longitude: location.longitude,
        },
        hobbies: value.hobbies,
        images: value.images,
        settings: {
          distance: value.settingDistance,
          gender: value.settingGender,
          old: value.settingOld,
        },
      };
      dataUpdate.images?.length === 0 && delete dataUpdate.images;
      dispatch(callApiUpdateUserInformation(dataUpdate)).then((result: any) => {
        if (result.payload?.response?.status !== 400) {
          message.success("Update information successfully.");
          dispatch(callApiGetInfo());
        } else message.error("Update information fail.");
      });
    } else
      dispatch(callApiPostUserInformation(data)).then((result: any) => {
        message.success("Update information successfully.");
        dispatch(callApiGetInfo());
        if (result?.payload?.status === 201) navigate("/");
      });
  };

  return (
    <div className={"w-full h-full " + className}>
      <Form
        size="large"
        layout="vertical"
        form={formRef}
        onFinish={handleSubmit}
      >
        <Steps current={current} items={items} />
        {steps.map((step, index) => (
          <div
            style={contentStyle}
            className={`${index === current ? "" : "hidden"}`}
          >
            {step.content}
          </div>
        ))}
        <div className="mt-6 flex justify-center">
          {current < steps.length - 1 && (
            <Button type="primary" danger onClick={() => next()}>
              Next
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button type="primary" danger htmlType="submit">
              Done
            </Button>
          )}
          {current > 0 && (
            <Button style={{ margin: "0 8px" }} onClick={() => prev()}>
              Previous
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
};

export default Info;
