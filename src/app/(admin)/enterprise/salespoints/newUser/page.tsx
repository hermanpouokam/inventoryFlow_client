"use client"
import CardBodyContent from '@/components/CardContent'
import { Combobox } from '@/components/ComboBox';
import { Button } from '@/components/ui/button'
import { fetchSalesPoints } from '@/redux/salesPointsSlicer';
import { AppDispatch, RootState } from '@/redux/store';
import useForm, { Field, initializeFormValues } from '@/utils/useFormHook';
import { Button as MuiButton, Divider, TextField, Menu, MenuItem, CircularProgress, Backdrop } from '@mui/material'
import { Check, ChevronDown, XCircle } from 'lucide-react';
import React, {  } from 'react'
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { getActionsPermissions, getPermissions, getRoles, registerEmployee } from '../function';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';

export default function Page() {

    const { t: tPermissions } = useTranslation('permissions');
    const { t: tCommon } = useTranslation('common');
    const [loading, setLoading] = React.useState(false)
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [roles, setRoles] = React.useState<Role[] | null>(null)
    const [permissions, setPermissions] = React.useState<ActionPermission[] | null>(null)
    const [pagePermissions, setPagePermissions] = React.useState<Permission[] | null>(null)
    const open = Boolean(anchorEl);
    // const [phoneNumber, setPhoneNumber] = useState<{
    //     number: string;
    //     country: string;
    // } | null>(null);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    // const [steps, setSteps] = useState('')
    const dispatch: AppDispatch = useDispatch()
    const [selectedRole, setSelectedRole] = React.useState<Role | null>(null)
    const getData = async () => {
        if (status === "idle") {
            dispatch(fetchSalesPoints());
        }
        setRoles(await getRoles())
        setPermissions(await getActionsPermissions())
        setPagePermissions(await getPermissions())
    };

    const { data, error, status } = useSelector(
        (state: RootState) => state.salesPoints
    );

    const fields: Field[] = React.useMemo(
        () => [
            {
                name: "sales_point",
                required: true,
                label: "Point de vente",
                type: "select",
                options: data,
            },
            {
                name: "user_type",
                required: true,
                label: "Type d'utlisateur",
                type: "select",
                options: ['manager', 'employee'],
            },
            {
                name: "name",
                required: true,
                label: "Nom",
                type: "text",
            },
            {
                name: "surname",
                required: true,
                label: "prénom",
                type: "text",
            },
            {
                name: "username",
                required: true,
                label: "Nom d'utilisateur",
                type: "text",
            },
            {
                name: "email",
                required: true,
                label: "Email",
                type: "text",
            },
            {
                name: "number",
                required: true,
                label: "Numéro de téléphone",
                type: "text",
            },
            {
                name: "password",
                required: true,
                label: "Mot de passe",
                type: "password",
            },
            {
                name: "role",
                required: true,
                label: "Role",
                type: "text",
            },
        ],
        [status]
    );

    React.useEffect(() => {
        getData();
    }, [
        status,
        dispatch,
    ]);

    const { toast } = useToast()
    const {
        errors,
        handleChange,
        handleSubmit,
        resetForm,
        values,
        setFieldValue,
        setValues,
        setFieldError
    } = useForm(initializeFormValues(fields));

    // const handlePhoneNumberChange = React.useCallback(({ number, country, error }: any) => {
    //     setFieldValue("number", number);
    //     setFieldValue("country", country);

    // }, []);

    const onSubmit = async () => {
        setLoading(true);
        console.log('submitted')
        try {
            if (!values["sales_point"]) {
                return setFieldError("sales_point", tCommon("sales_point_type_select_error"));
            }
            if (!values["user_type"]) {
                return setFieldError("user_type", tCommon("user_type_select_error"));
            }
            // setSteps(tCommon('user_creation'))
            const ids = pagePermissions?.map(pms => pms.id)
            const idsActions = permissions?.map(pms => pms.id)
            const res = await registerEmployee({ ...values, permission_ids: ids, action_permission_ids: idsActions });
            if (res?.status === 201) {
                resetForm();
                toast({
                    variant: "success",
                    title: "Succès",
                    description: `${tCommon('user_created')}.`,
                    className: "bg-green-600 border-green-600 text-white",
                    icon: <Check className="mr-2" />,
                });
                setTimeout(() => {
                    // window.location.reload();
                }, 1000);
            } else {
                setFieldError(
                    "form",
                    "Une erreur inattendu s'est produite vérifiez votre connexion et réessayez"
                );
            }
        } catch (error) {
            console.log(error)
            setFieldError(
                "form",
                tCommon(`${error.response?.data.message}`)
            );
        } finally {
            setLoading(false);
            // setSteps('')
        }
    };




    return (
        <>
            <div className="space-y-5">
                <Backdrop
                    sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={loading}
                >
                    <div className='flex flex-col items-center'>
                        <CircularProgress color="inherit" />
                    </div>
                </Backdrop>
                <form method='post' className='space-y-5' onSubmit={(e) => handleSubmit(e, onSubmit)}>
                    <CardBodyContent>
                        <div className="flex flex-row justify-between items-center">
                            <h2 className="text-base font-medium">Ajouter un utilisateur</h2>
                            <Button
                                variant="default"
                                type='submit'
                                className="bg-green-600 hover:bg-green-500"
                            >
                                Terminer
                            </Button>
                        </div>
                    </CardBodyContent>
                    <CardBodyContent className='space-y-5'>
                        {errors['form'] &&
                            <h3 className='border select-none border-red-600 text-red-600 bg-red-200 block text-center rounded py-2'>{errors['form']}</h3>
                        }
                        <Divider className='uppercase my-5'>
                            {"Informations de l'utilisateur"}
                        </Divider>
                        <div className="grid grid-cols-1 gap-3 items-center sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                            {fields.map((input) => {
                                // if (input.name === "number" && input.type === "text") {
                                //     return (
                                //         <div key={input.name}>
                                //             <PhoneNumberField
                                //                 key={phoneNumber?.number}
                                //                 value={phoneNumber?.number}
                                //                 onChange={handlePhoneNumberChange}
                                //             />
                                //         </div>
                                //     );
                                // }
                                if (input.type === "select" && Array.isArray(input.options)) {
                                    return (
                                        <div key={input.name}>
                                            <Combobox
                                                RightIcon={ChevronDown}
                                                options={input.options}
                                                buttonLabel={input.label + " *"}
                                                onValueChange={(e) => {
                                                    if (input.name === "sales_point") {
                                                        setFieldValue(input.name, e?.id);
                                                        setValues((prevValues) => ({
                                                            ...prevValues,
                                                        }));
                                                        getData();
                                                    }
                                                    if (input.name === "user_type") {
                                                        setFieldValue(input.name, e);
                                                        setValues((prevValues) => ({
                                                            ...prevValues,
                                                        }));
                                                    }
                                                }}
                                                value={input.name === "sales_point" ? data.find(
                                                    (s) => s.id == values["sales_point"]
                                                ) : values[input.name]}
                                                getOptionValue={(option) => {
                                                    if (input.name === "user_type") {
                                                        return `${option}`
                                                    }
                                                    return `${option.id} ${option.name} ${input.name == "sales_point" ? option?.address : ""
                                                        }`
                                                }
                                                }
                                                placeholder={input.label}
                                                className="z-[99999] popover-content-width-full"
                                                buttonClassName={
                                                    errors[input.name] && "border-red-500"
                                                }
                                                getOptionLabel={(option) => {
                                                    if (input.name === "user_type") {
                                                        return `${option}`
                                                    }
                                                    return `${option.name} ${input.name == "sales_point"
                                                        ? " - " + option?.address
                                                        : ""
                                                        }`
                                                }
                                                }
                                            />
                                            {errors[input.name] && (
                                                <p className="text-red-500 text-xs font-medium ml-4 mt-1">
                                                    {errors[input.name]}
                                                </p>
                                            )}
                                        </div>
                                    );
                                }
                                if (
                                    input.type === "text" ||
                                    input.type === "email" ||
                                    input.type === "number" || input.type == 'password'
                                ) {
                                    return (
                                        <TextField
                                            key={input.name}
                                            fullWidth
                                            margin="dense"
                                            label={input.label}
                                            type={input.type}
                                            required={input.required}
                                            size="small"
                                            name={input.name}
                                            value={values[input.name]}
                                            onChange={handleChange}
                                            error={!!errors[input.name]}
                                            helperText={errors[input.name]}
                                        />
                                    );
                                }
                            })}
                        </div>

                        <Divider className='uppercase my-5 space-x-1'>
                            {"Permissions de l'utilisateur"}
                            <MuiButton
                                id="basic-button"
                                aria-controls={open ? 'basic-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={open ? 'true' : undefined}
                                onClick={handleClick}
                            >
                                {selectedRole ? selectedRole.name : "Tout"}
                                <ChevronDown className='w-4 h-4' />
                            </MuiButton>
                            <Menu
                                id="basic-menu"
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                                MenuListProps={{
                                    'aria-labelledby': 'basic-button',
                                }}
                            >
                                <MenuItem
                                    onClick={async () => {
                                        setSelectedRole(null);
                                        setPermissions(await getActionsPermissions())
                                        handleClose()
                                    }}
                                >Tout</MenuItem>
                                {
                                    roles?.map((role, i) => (
                                        <MenuItem
                                            key={i}
                                            onClick={() => {
                                                setSelectedRole(role);
                                                setPermissions(role.action_permissions);
                                                handleClose()
                                            }}
                                        >{role.name}</MenuItem>
                                    ))
                                }
                            </Menu>
                        </Divider>
                        <p className='text-accent-foreground text-sm font-medium'>{tCommon('user_permission_text')}</p>
                        <div className='flex flex-wrap gap-2'>
                            {permissions ?
                                permissions.length > 0 ?
                                    permissions.map((pms, i) => (
                                        <div key={i} className='px-2 border w-auto rounded-full flex items-center space-x-1'>
                                            <span className='text-sm select-none'>{tPermissions(`${pms.name}`)}</span>
                                            <Button
                                                onClick={() => {
                                                    console.log("Before:", permissions);
                                                    const index = permissions.findIndex(perm => perm.name === pms.name);
                                                    if (index !== -1) {
                                                        const updatedPermissions = [...permissions];
                                                        updatedPermissions.splice(index, 1); // supprime une seule occurrence
                                                        setPermissions(updatedPermissions);
                                                    }
                                                }}

                                                className='h-[25px] p-1'
                                                variant={'ghost'}
                                                size={'sm'}
                                            >
                                                <XCircle className='w-4 h-4 text-red-500' />
                                            </Button>
                                        </div>
                                    ))
                                    : <p className='text-base text-center font-normal w-full'>{tCommon('no_permission')}</p>
                                : <p className='text-base text-center font-normal w-full'>{tCommon('loading')}...</p>}
                        </div>
                        <Divider className='uppercase my-5 space-x-1'>
                            {"Permissions de page de l'utilisateur"}
                        </Divider>
                        <p className='mb-5 text-accent-foreground text-sm font-medium'>{tCommon('user_page_permission_text')}</p>
                        <div className='flex flex-wrap gap-2'>
                            {pagePermissions ?
                                pagePermissions.length > 0 ?
                                    pagePermissions.map((pms, i) => (
                                        <div key={i} className='px-2 border w-auto rounded-full flex items-center space-x-1'>
                                            <span className='text-sm select-none'>{tPermissions(`${pms.name}`)}</span>
                                            <Button
                                                onClick={() => {
                                                    console.log("Before:", pagePermissions);
                                                    const index = pagePermissions.findIndex(perm => perm.name === pms.name);
                                                    if (index !== -1) {
                                                        const updatedPermissions = [...pagePermissions];
                                                        updatedPermissions.splice(index, 1); // supprime une seule occurrence
                                                        setPagePermissions(updatedPermissions);
                                                    }
                                                }}

                                                className='h-[25px] p-1'
                                                variant={'ghost'}
                                                size={'sm'}
                                            >
                                                <XCircle className='w-4 h-4 text-red-500' />
                                            </Button>
                                        </div>
                                    ))
                                    : <p className='text-base text-center font-normal w-full'>{tCommon('no_permission')}</p>
                                : <p className='text-base text-center font-normal w-full'>{tCommon('loading')}...</p>}
                        </div>
                    </CardBodyContent>
                </form>

            </div>
        </>
    )
}
