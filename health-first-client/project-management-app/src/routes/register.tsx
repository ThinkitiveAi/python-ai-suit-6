import { useState } from "react";
import { useForm } from "@mantine/form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { notifications } from "@mantine/notifications";
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Select,
  NumberInput,
  FileInput,
  Checkbox,
  Button,
  Group,
  Stack,
  Divider,
  Box,
  Center,
  Grid,
  Textarea,
  Avatar,
  Progress,
  Modal,
  rem,
} from "@mantine/core";
import {
  IconUser,
  IconMail,
  IconPhone,
  IconLock,
  IconStethoscope,
  IconUpload,
  IconFileText,
  IconBuilding,
  IconMapPin,
  IconCertificate,
  IconArrowLeft,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { api } from "../services/api";
import type { ProviderCreateRequest } from "../services/api";

export const Route = createFileRoute("/register")({
  component: Register,
});

interface RegistrationForm {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePhoto: File | null;

  // Professional Information
  licenseNumber: string;
  specialization: string;
  yearsExperience: number | "";
  qualifications: string;

  // Practice Information
  practiceName: string;
  practiceType: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;

  // Account Security
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

const specializations = [
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Neurology",
  "Orthopedics",
  "Psychiatry",
  "Oncology",
  "Emergency Medicine",
  "Family Medicine",
  "Internal Medicine",
  "Obstetrics & Gynecology",
  "Ophthalmology",
  "Radiology",
  "Surgery",
  "Anesthesiology",
  "Pathology",
  "Urology",
  "Endocrinology",
  "Gastroenterology",
  "Pulmonology",
];

const practiceTypes = [
  "Private Practice",
  "Hospital",
  "Clinic",
  "Medical Center",
  "Urgent Care",
  "Specialty Center",
  "Academic Medical Center",
  "Community Health Center",
];

function Register() {
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const form = useForm<RegistrationForm>({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      profilePhoto: null,
      licenseNumber: "",
      specialization: "",
      yearsExperience: "",
      qualifications: "",
      practiceName: "",
      practiceType: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
    validate: {
      firstName: (value) => {
        if (!value) return "First name is required";
        if (value.length < 2) return "First name must be at least 2 characters";
        return null;
      },
      lastName: (value) => {
        if (!value) return "Last name is required";
        if (value.length < 2) return "Last name must be at least 2 characters";
        return null;
      },
      email: (value) => {
        if (!value) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value))
          return "Please enter a valid email address";
        return null;
      },
      phone: (value) => {
        if (!value) return "Phone number is required";
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ""))) {
          return "Please enter a valid phone number";
        }
        return null;
      },
      licenseNumber: (value) => {
        if (!value) return "Medical license number is required";
        if (value.length < 5)
          return "License number must be at least 5 characters";
        return null;
      },
      specialization: (value) => {
        if (!value) return "Specialization is required";
        return null;
      },
      yearsExperience: (value) => {
        if (!value) return "Years of experience is required";
        if (value < 0 || value > 50)
          return "Please enter a valid number of years";
        return null;
      },
      qualifications: (value) => {
        if (!value) return "Medical qualifications are required";
        return null;
      },
      practiceName: (value) => {
        if (!value) return "Practice name is required";
        return null;
      },
      practiceType: (value) => {
        if (!value) return "Practice type is required";
        return null;
      },
      streetAddress: (value) => {
        if (!value) return "Street address is required";
        return null;
      },
      city: (value) => {
        if (!value) return "City is required";
        return null;
      },
      state: (value) => {
        if (!value) return "State is required";
        return null;
      },
      zipCode: (value) => {
        if (!value) return "ZIP code is required";
        const zipRegex = /^\d{5}(-\d{4})?$/;
        if (!zipRegex.test(value)) return "Please enter a valid ZIP code";
        return null;
      },
      password: (value) => {
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";

        // Calculate password strength
        let strength = 0;
        if (value.length >= 8) strength += 25;
        if (/[a-z]/.test(value)) strength += 25;
        if (/[A-Z]/.test(value)) strength += 25;
        if (/[0-9!@#$%^&*]/.test(value)) strength += 25;
        setPasswordStrength(strength);

        return null;
      },
      confirmPassword: (value, values) => {
        if (!value) return "Please confirm your password";
        if (value !== values.password) return "Passwords do not match";
        return null;
      },
      termsAccepted: (value) => {
        if (!value) return "You must accept the terms and conditions";
        return null;
      },
    },
  });

  const handlePhotoUpload = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
    form.setFieldValue("profilePhoto", file);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return "red";
    if (passwordStrength <= 50) return "orange";
    if (passwordStrength <= 75) return "yellow";
    return "green";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return "Weak";
    if (passwordStrength <= 50) return "Fair";
    if (passwordStrength <= 75) return "Good";
    return "Strong";
  };

  const handleSubmit = async (values: RegistrationForm) => {
    setLoading(true);

    try {
      // Prepare the data according to API schema
      const registrationData: ProviderCreateRequest = {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone_number: values.phone,
        specialization: values.specialization,
        license_number: values.licenseNumber,
        years_of_experience: values.yearsExperience as number,
        clinic_address: {
          street: values.streetAddress,
          city: values.city,
          state: values.state,
          zip: values.zipCode,
        },
        license_document_url: "https://example.com/license.pdf", // TODO: Implement file upload
        password: values.password,
        confirm_password: values.confirmPassword,
      };

      const response = await api.provider.register(registrationData);

      if (response.success) {
        notifications.show({
          title: "Registration Successful!",
          message:
            "Your account has been created successfully. You can now log in.",
          color: "green",
          icon: <IconCheck size={16} />,
        });

        // Redirect to login after a brief delay
        setTimeout(() => {
          navigate({ to: "/login" });
        }, 2000);
      } else {
        throw new Error(response.error || "Registration failed");
      }
    } catch (error) {
      notifications.show({
        title: "Registration Failed",
        message:
          error instanceof Error
            ? error.message
            : "An error occurred during registration. Please try again.",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate({ to: "/login" });
  };

  return (
    <Container size="lg" py="xl">
      <Paper
        shadow="md"
        p="xl"
        radius="md"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          border: "1px solid #e2e8f0",
        }}
      >
        {/* Header */}
        <Center mb="xl">
          <Stack align="center" gap="xs">
            <Box
              style={{
                width: rem(60),
                height: rem(60),
                borderRadius: "50%",
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: rem(8),
              }}
            >
              <IconStethoscope size={32} color="white" />
            </Box>
            <Title order={1} size="h2" ta="center" c="#1e293b">
              Provider Registration
            </Title>
            <Text c="dimmed" size="sm" ta="center">
              Create your healthcare provider account
            </Text>
          </Stack>
        </Center>

        {/* Back to Login Link */}
        <Group justify="flex-start" mb="md">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBackToLogin}
            size="sm"
          >
            Back to Login
          </Button>
        </Group>

        {/* Registration Form */}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="xl">
            {/* Personal Information Section */}
            <Box>
              <Title order={3} size="h4" mb="md" c="#1e293b">
                Personal Information
              </Title>
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="First Name"
                    placeholder="Enter your first name"
                    leftSection={<IconUser size={16} />}
                    required
                    {...form.getInputProps("firstName")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Last Name"
                    placeholder="Enter your last name"
                    leftSection={<IconUser size={16} />}
                    required
                    {...form.getInputProps("lastName")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Email Address"
                    placeholder="Enter your email address"
                    leftSection={<IconMail size={16} />}
                    required
                    {...form.getInputProps("email")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    leftSection={<IconPhone size={16} />}
                    required
                    {...form.getInputProps("phone")}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <FileInput
                    label="Profile Photo"
                    placeholder="Upload your profile photo"
                    accept="image/*"
                    leftSection={<IconUpload size={16} />}
                    onChange={handlePhotoUpload}
                    value={form.values.profilePhoto}
                    styles={{
                      input: {
                        borderColor: "#e2e8f0",
                      },
                    }}
                  />
                  {photoPreview && (
                    <Box mt="sm" style={{ textAlign: "center" }}>
                      <Avatar
                        src={photoPreview}
                        size="xl"
                        radius="xl"
                        style={{ margin: "0 auto" }}
                      />
                    </Box>
                  )}
                </Grid.Col>
              </Grid>
            </Box>

            <Divider />

            {/* Professional Information Section */}
            <Box>
              <Title order={3} size="h4" mb="md" c="#1e293b">
                Professional Information
              </Title>
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Medical License Number"
                    placeholder="Enter your license number"
                    leftSection={<IconCertificate size={16} />}
                    required
                    {...form.getInputProps("licenseNumber")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="Specialization"
                    placeholder="Select your specialization"
                    leftSection={<IconStethoscope size={16} />}
                    data={specializations}
                    searchable
                    required
                    {...form.getInputProps("specialization")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <NumberInput
                    label="Years of Experience"
                    placeholder="Enter years of experience"
                    // leftSection={<IconGraduationCap size={16} />}
                    min={0}
                    max={50}
                    required
                    {...form.getInputProps("yearsExperience")}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea
                    label="Medical Qualifications"
                    placeholder="Enter your medical degrees and qualifications"
                    leftSection={<IconFileText size={16} />}
                    rows={3}
                    required
                    {...form.getInputProps("qualifications")}
                  />
                </Grid.Col>
              </Grid>
            </Box>

            <Divider />

            {/* Practice Information Section */}
            <Box>
              <Title order={3} size="h4" mb="md" c="#1e293b">
                Practice Information
              </Title>
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Practice Name"
                    placeholder="Enter practice/hospital name"
                    leftSection={<IconBuilding size={16} />}
                    required
                    {...form.getInputProps("practiceName")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="Practice Type"
                    placeholder="Select practice type"
                    leftSection={<IconBuilding size={16} />}
                    data={practiceTypes}
                    required
                    {...form.getInputProps("practiceType")}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput
                    label="Street Address"
                    placeholder="Enter street address"
                    leftSection={<IconMapPin size={16} />}
                    required
                    {...form.getInputProps("streetAddress")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <TextInput
                    label="City"
                    placeholder="Enter city"
                    required
                    {...form.getInputProps("city")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <TextInput
                    label="State"
                    placeholder="Enter state"
                    required
                    {...form.getInputProps("state")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <TextInput
                    label="ZIP Code"
                    placeholder="Enter ZIP code"
                    required
                    {...form.getInputProps("zipCode")}
                  />
                </Grid.Col>
              </Grid>
            </Box>

            <Divider />

            {/* Account Security Section */}
            <Box>
              <Title order={3} size="h4" mb="md" c="#1e293b">
                Account Security
              </Title>
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <PasswordInput
                    label="Password"
                    placeholder="Create a strong password"
                    leftSection={<IconLock size={16} />}
                    required
                    {...form.getInputProps("password")}
                  />
                  {form.values.password && (
                    <Box mt="xs">
                      <Text size="xs" c="dimmed" mb="xs">
                        Password Strength: {getPasswordStrengthText()}
                      </Text>
                      <Progress
                        value={passwordStrength}
                        color={getPasswordStrengthColor()}
                        size="sm"
                      />
                    </Box>
                  )}
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <PasswordInput
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    leftSection={<IconLock size={16} />}
                    required
                    {...form.getInputProps("confirmPassword")}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Checkbox
                    label={
                      <Text size="sm">
                        I accept the{" "}
                        <Button
                          variant="subtle"
                          size="xs"
                          p={0}
                          onClick={() => setTermsModalOpen(true)}
                          style={{ color: "#2563eb" }}
                        >
                          Terms and Conditions
                        </Button>
                      </Text>
                    }
                    {...form.getInputProps("termsAccepted", {
                      type: "checkbox",
                    })}
                  />
                </Grid.Col>
              </Grid>
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                height: rem(56),
                fontSize: "18px",
              }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </Stack>
        </form>
      </Paper>

      {/* Terms and Conditions Modal */}
      <Modal
        opened={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        title="Terms and Conditions"
        size="lg"
      >
        <Stack gap="md">
          <Text size="sm">
            By registering as a healthcare provider, you agree to the following
            terms and conditions:
          </Text>
          <Text size="sm">
            1. You certify that all information provided is accurate and
            truthful.
          </Text>
          <Text size="sm">
            2. You agree to maintain the confidentiality of patient information.
          </Text>
          <Text size="sm">
            3. You will comply with all applicable healthcare regulations and
            standards.
          </Text>
          <Text size="sm">
            4. You understand that your account may be subject to verification
            and approval.
          </Text>
          <Text size="sm">
            5. You agree to receive communications related to your account and
            the platform.
          </Text>
          <Button
            onClick={() => setTermsModalOpen(false)}
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            }}
          >
            I Understand
          </Button>
        </Stack>
      </Modal>
    </Container>
  );
}
