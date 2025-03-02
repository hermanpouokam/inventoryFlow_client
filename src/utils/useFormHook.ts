// import { useState } from "react";

// type FormFields = Record<string, any>;

// export type FormErrors = {
//   [key: string]: string;
// };

// const useForm = (initialValues: FormFields) => {
//   const [values, setValues] = useState<FormFields>(initialValues);
//   const [errors, setErrors] = useState<FormErrors>({});

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     //@ts-ignore
//     const { name, type, value, checked } = e.target;

//     const fieldValue = type === "checkbox" ? checked : value;
//     setValues({
//       ...values,
//       [name]: fieldValue,
//     });
//   };

//   const validate = (fieldValues: FormFields = values): FormErrors => {
//     let temp: FormErrors = {};

//     if ("email" in fieldValues)
//       temp.email = /$^|.+@.+..+/.test(fieldValues.email) ? "" : "Email invalid";

//     if ("password" in fieldValues)
//       temp.password =
//         fieldValues.password.length > 8
//           ? ""
//           : "Password must be at least 8 characters long.";

//     if ("number" in fieldValues)
//       temp.number = isNaN(Number(fieldValues.number))
//         ? ""
//         : "Entrez un nombre valide";

//     setErrors(temp); // Met à jour les erreurs

//     return temp; // Retourne les erreurs immédiatement
//   };

//   const setFieldError = (fieldName: string, errorMessage: string) => {
//     setErrors({
//       ...errors,
//       [fieldName]: errorMessage,
//     });
//   };

//   const setFieldValue = (fieldName: string, value: any) => {
//     setValues({
//       ...values,
//       [fieldName]: value,
//     });
//   };

//   const handleSubmit = async (
//     e: React.FormEvent<HTMLFormElement>,
//     callback: () => void
//   ) => {
//     e.preventDefault();
//     validate();
//     if (Object.values(errors).every((x) => x === "")) {
//       try {
//         await callback();
//       } catch (error) {
//         console.error("Form submission error:", error);
//         setFieldError(
//           "form",
//           "An unexpected error occurred during form submission."
//         );
//       }
//     }
//   };

//   const resetForm = () => {
//     setValues(initialValues);
//     setErrors({});
//   };

//   return {
//     values,
//     setValues,
//     errors,
//     handleChange,
//     handleSubmit,
//     validate,
//     setFieldError,
//     resetForm,
//     setFieldValue,
//     setErrors,
//   };
// };

type Field = {
  name: string;
  label: string;
  required: boolean;
  value?: string | boolean | number;
  type: string;
  options?: Supplier[] | SalesPoint[] | Category[];
};

// export default useForm;

// export const initializeFormValues = (fields: Field[]): FormFields => {
//   const initialValues: FormFields = {};

//   fields.forEach((field) => {
//     if (field.type === "text") {
//       initialValues[field.name] = field.value ?? "";
//     } else if (field.type === "number") {
//       initialValues[field.name] = field.value ?? "";
//     } else if (field.type === "checkbox") {
//       initialValues[field.name] = field.value ?? false;
//     } else {
//       initialValues[field.name] = field.value ?? null;
//     }
//   });

//   return initialValues;
// };

import { useState } from "react";

type FormFields = Record<string, any>;

type FormErrors = {
  [key: string]: string;
};

const useForm = (initialValues: FormFields) => {
  const [values, setValues] = useState<FormFields>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  // Fonction pour gérer les changements de champ
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    //@ts-ignore
    const { name, type, value, checked } = e.target;

    const fieldValue = type === "checkbox" ? checked : value;
    setValues({
      ...values,
      [name]: fieldValue,
    });
  };

  // Fonction de validation qui met à jour les erreurs
  const validate = (fieldValues: FormFields = values): boolean => {
    let tempErrors: FormErrors = {};

    if ("email" in fieldValues) {
      const email = fieldValues.email || "";
      tempErrors.email =
        email.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          ? ""
          : "Email invalide";
    }

    if ("password" in fieldValues)
      tempErrors.password =
        fieldValues.password.length >= 8
          ? ""
          : "Le mot de passe doit contenir au moins 8 caractères.";

    if ("number" in fieldValues)
      tempErrors.number = isNaN(Number(fieldValues.number))
        ? "Entrez un nombre valide"
        : "";

    // Mise à jour de l'état des erreurs
    setErrors(tempErrors);

    // Retourne `true` si aucune erreur n'existe
    return Object.values(tempErrors).every((x) => x === "");
  };

  // Fonction pour définir une erreur spécifique
  const setFieldError = (fieldName: string, errorMessage: string) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: errorMessage,
    }));
  };

  // Fonction pour définir une valeur spécifique
  const setFieldValue = (fieldName: string, value: any) => {
    setValues((prevValues) => ({
      ...prevValues,
      [fieldName]: value,
    }));
  };

  // Fonction de soumission avec gestion correcte des erreurs
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    callback: () => void
  ) => {
    e.preventDefault();

    // Lancer la validation avant de soumettre
    const isValid = validate();

    // Vérifier si des erreurs existent
    if (!isValid) return;

    try {
      await callback();
    } catch (error) {
      console.error("Form submission error:", error);
      setFieldError(
        "form",
        "Une erreur inattendue s'est produite lors de la soumission du formulaire."
      );
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    setValues,
    errors,
    handleChange,
    handleSubmit,
    validate,
    setFieldError,
    resetForm,
    setFieldValue,
    setErrors,
  };
};

// Fonction pour initialiser les valeurs du formulaire
export const initializeFormValues = (fields: Field[]): FormFields => {
  const initialValues: FormFields = {};

  fields.forEach((field) => {
    if (field.type === "text") {
      initialValues[field.name] = field.value ?? "";
    } else if (field.type === "number") {
      initialValues[field.name] = field.value ?? 0;
    } else if (field.type === "checkbox") {
      initialValues[field.name] = field.value ?? false;
    } else {
      initialValues[field.name] = field.value ?? null;
    }
  });

  return initialValues;
};

export default useForm;
