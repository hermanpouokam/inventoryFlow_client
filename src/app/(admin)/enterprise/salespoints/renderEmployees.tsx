'use client'
import * as React from "react";
import { Avatar, Chip, CircularProgress, Divider, ListItem, ListItemAvatar, ListItemButton, ListItemText } from "@mui/material";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { fetchEmployees } from "@/redux/employeesSlicer";
import { SearchX } from "lucide-react";
import WorkIcon from '@mui/icons-material/Work';
import { formatteCurrency } from "../../stock/functions";

function RenderRow({ employee }: { employee: Employee }) {

    return (
        <>
            <ListItem
                secondaryAction={
                    <>
                        <Chip
                            label={formatteCurrency(parseFloat(employee.monthly_salary), 'XAF', 'fr-FR')}
                            color={parseFloat(employee.monthly_salary) < parseFloat(employee.salary) * 1 / 3 ?
                                'error'
                                :
                                parseFloat(employee.monthly_salary) < parseFloat(employee.salary) * 2 / 3 ?
                                    'info'
                                    :
                                    'success'
                            }
                        />

                    </>
                }
                component="div" disablePadding>
                <ListItemButton>
                    <ListItemAvatar>
                        <Avatar>
                            <WorkIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={employee.name} secondary={employee.role} />
                </ListItemButton>
            </ListItem>
            <Divider variant="inset" />
        </>
    );
}

function RenderEmpoyees({ salespoint }: { salespoint: number }) {

    const dispatch: AppDispatch = useDispatch()
    const { data, error, status } = useSelector((state: RootState) => state.employees)

    React.useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchEmployees({ ...(salespoint != 0 ? { sales_point: salespoint } : {}) }))
        }
    }, [status, dispatch, salespoint]);

    return (
        <div className="scrollbar h-full overflow-y-auto">
            {
                error ?
                    <div className="w-[95%] h-[95%] flex flex-col justify-center items-center">
                        <SearchX className="text-muted-foreground w-7 h-7" />
                        <h2 className="text-base font-semibold text-muted-foreground">une erreur inattendue s&apos;est produite</h2>
                    </div>
                    :
                    status == 'loading' ?
                        <div className="w-[95%] h-[95%] flex justify-center items-center">
                            <CircularProgress size={20} />
                        </div>
                        :
                        data.length > 0 ?
                            data.map(item => <RenderRow key={item.id} employee={item} />)
                            :

                            <h2 className="text-base font-semibold text-muted-foreground">Aucun employé trouvé</h2>

            }
        </div>
    )
}

export default RenderEmpoyees