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
  FileInput,
  Checkbox,
  Button,
  Group,
  Stack,
  Divider,
  Box,
  Center,
  Grid,
  Avatar,
  Progress,
  Modal,
  rem,
  Alert,
} from "@mantine/core";
import {
  IconUser,
  IconMail,
  IconPhone,
  IconLock,
  IconUserPlus,
  IconUpload,
  IconMapPin,
  IconCalendar,
  IconShield,
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { api } from "../services/api";
import type { PatientCreateRequest } from "../services/api";

export const Route = createFileRoute("/patient-register")({
  component: PatientRegister,
});

interface PatientRegistrationForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  profilePhoto: File | null;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContactName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  hipaaAccepted: boolean;
}

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

const relationshipOptions = [
  { value: "spouse", label: "Spouse" },
  { value: "parent", label: "Parent" },
  { value: "sibling", label: "Sibling" },
  { value: "child", label: "Child" },
  { value: "friend", label: "Friend" },
  { value: "other", label: "Other" },
];

const stateOptions = [
  { value: "CA", label: "California" },
  { value: "NY", label: "New York" },
  { value: "TX", label: "Texas" },
  { value: "FL", label: "Florida" },
  { value: "IL", label: "Illinois" },
  { value: "PA", label: "Pennsylvania" },
  { value: "OH", label: "Ohio" },
  { value: "GA", label: "Georgia" },
  { value: "NC", label: "North Carolina" },
  { value: "MI", label: "Michigan" },
];

function PatientRegister() {
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [hipaaModalOpen, setHipaaModalOpen] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  const form = useForm<PatientRegistrationForm>({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      profilePhoto: null,
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      emergencyContactName: "",
      emergencyRelationship: "",
      emergencyPhone: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
      privacyAccepted: false,
      hipaaAccepted: false,
    },
    validate: {
      firstName: (value) =>
        !value
          ? "First name is required"
          : value.length < 2
            ? "First name must be at least 2 characters"
            : null,
      lastName: (value) =>
        !value
          ? "Last name is required"
          : value.length < 2
            ? "Last name must be at least 2 characters"
            : null,
      email: (value) => {
        if (!value) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value)
          ? "Please enter a valid email address"
          : null;
      },
      phone: (value) => {
        if (!value) return "Phone number is required";
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return !phoneRegex.test(value.replace(/[\s\-\(\)]/g, ""))
          ? "Please enter a valid phone number"
          : null;
      },
      dateOfBirth: (value) => {
        if (!value) return "Date of birth is required";
        const today = new Date();
        const birthDate = new Date(value);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }
        if (age < 13) return "You must be at least 13 years old to register";
        if (age > 120) return "Please enter a valid date of birth";
        return null;
      },
      gender: (value) => (!value ? "Please select your gender" : null),
      streetAddress: (value) => (!value ? "Street address is required" : null),
      city: (value) => (!value ? "City is required" : null),
      state: (value) => (!value ? "State is required" : null),
      zipCode: (value) => {
        if (!value) return "ZIP code is required";
        const zipRegex = /^\d{5}(-\d{4})?$/;
        return !zipRegex.test(value) ? "Please enter a valid ZIP code" : null;
      },
      emergencyContactName: (value) =>
        !value ? "Emergency contact name is required" : null,
      emergencyRelationship: (value) =>
        !value
          ? "Please select your relationship to the emergency contact"
          : null,
      emergencyPhone: (value) => {
        if (!value) return "Emergency contact phone is required";
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return !phoneRegex.test(value.replace(/[\s\-\(\)]/g, ""))
          ? "Please enter a valid phone number"
          : null;
      },
      password: (value) => {
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";

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
        return value !== values.password ? "Passwords do not match" : null;
      },
      termsAccepted: (value) =>
        !value ? "You must accept the terms of service" : null,
      privacyAccepted: (value) =>
        !value ? "You must accept the privacy policy" : null,
      hipaaAccepted: (value) =>
        !value ? "You must accept the HIPAA consent" : null,
    },
  });

  const handlePhotoUpload = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target?.result as string);
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

  const handleSubmit = async (values: PatientRegistrationForm) => {
    setLoading(true);

    try {
      // Prepare the data according to API schema
      const registrationData: PatientCreateRequest = {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone_number: values.phone,
        date_of_birth: values.dateOfBirth,
        gender: values.gender as
          | "male"
          | "female"
          | "other"
          | "prefer_not_to_say",
        address: {
          street: values.streetAddress,
          city: values.city,
          state: values.state,
          zip: values.zipCode,
        },
        emergency_contact: values.emergencyContactName
          ? {
              name: values.emergencyContactName,
              phone: values.emergencyPhone,
              relationship: values.emergencyRelationship,
            }
          : null,
        medical_history: null, // TODO: Add medical history field to form
        insurance_info: null, // TODO: Add insurance info field to form
        password: values.password,
        confirm_password: values.confirmPassword,
      };

      const response = await api.patient.register(registrationData);

      if (response.success) {
        notifications.show({
          title: "Welcome to Our Healthcare Family! 🎉",
          message:
            "Your account has been created successfully. Please check your email for verification.",
          color: "green",
          icon: <IconCheck size={16} />,
        });

        // Redirect to login after a brief delay
        setTimeout(() => {
          navigate({ to: "/patient-login" });
        }, 2000);
      } else {
        throw new Error(response.error || "Registration failed");
      }
    } catch (error) {
      notifications.show({
        title: "Registration Unsuccessful",
        message:
          error instanceof Error
            ? error.message
            : "We encountered an issue. Please try again or contact support.",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="lg" py="xl">
      <Paper
        shadow="sm"
        p="xl"
        radius="lg"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }}
      >
        {/* Header */}
        <Center mb="xl">
          <Stack align="center" gap="xs">
            <Box
              style={{
                width: rem(70),
                height: rem(70),
                borderRadius: "50%",
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: rem(12),
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
              }}
            >
              <IconUserPlus size={36} color="white" />
            </Box>
            <Title
              order={1}
              size="h2"
              ta="center"
              c="#1e293b"
              style={{ fontWeight: 600 }}
            >
              Join Our Healthcare Family
            </Title>
            <Text c="dimmed" size="lg" ta="center" style={{ fontWeight: 400 }}>
              Create your account to access personalized healthcare services
            </Text>
          </Stack>
        </Center>

        {/* Back to Login Link */}
        <Group justify="flex-start" mb="md">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate({ to: "/patient-login" })}
            size="sm"
          >
            Back to Login
          </Button>
        </Group>

        {/* Security Notice */}
        <Alert
          icon={<IconShield size={16} />}
          title="Your Privacy & Security"
          color="blue"
          variant="light"
          mb="lg"
          style={{ borderRadius: "8px" }}
        >
          <Text size="sm">
            Your health information is protected with bank-level security. We
            follow HIPAA guidelines and never share your data without your
            permission.
          </Text>
        </Alert>

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
                    size="md"
                    {...form.getInputProps("firstName")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Last Name"
                    placeholder="Enter your last name"
                    leftSection={<IconUser size={16} />}
                    required
                    size="md"
                    {...form.getInputProps("lastName")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Email Address"
                    placeholder="Enter your email address"
                    leftSection={<IconMail size={16} />}
                    required
                    size="md"
                    {...form.getInputProps("email")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Phone Number"
                    placeholder="Enter your phone number"
                    leftSection={<IconPhone size={16} />}
                    required
                    size="md"
                    {...form.getInputProps("phone")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Date of Birth"
                    placeholder="Select your date of birth"
                    leftSection={<IconCalendar size={16} />}
                    required
                    size="md"
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    min="1900-01-01"
                    {...form.getInputProps("dateOfBirth")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="Gender"
                    placeholder="Select your gender"
                    data={genderOptions}
                    required
                    size="md"
                    {...form.getInputProps("gender")}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <FileInput
                    label="Profile Photo (Optional)"
                    placeholder="Upload your profile photo"
                    accept="image/*"
                    leftSection={<IconUpload size={16} />}
                    onChange={handlePhotoUpload}
                    value={form.values.profilePhoto}
                    size="md"
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

            {/* Address Information Section */}
            <Box>
              <Title order={3} size="h4" mb="md" c="#1e293b">
                Address Information
              </Title>
              <Grid gutter="md">
                <Grid.Col span={12}>
                  <TextInput
                    label="Street Address"
                    placeholder="Enter your street address"
                    leftSection={<IconMapPin size={16} />}
                    required
                    size="md"
                    {...form.getInputProps("streetAddress")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <TextInput
                    label="City"
                    placeholder="Enter your city"
                    required
                    size="md"
                    {...form.getInputProps("city")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Select
                    label="State"
                    placeholder="Select your state"
                    data={stateOptions}
                    required
                    size="md"
                    {...form.getInputProps("state")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <TextInput
                    label="ZIP Code"
                    placeholder="Enter ZIP code"
                    required
                    size="md"
                    {...form.getInputProps("zipCode")}
                  />
                </Grid.Col>
              </Grid>
            </Box>

            <Divider />

            {/* Emergency Contact Section */}
            <Box>
              <Title order={3} size="h4" mb="md" c="#1e293b">
                Emergency Contact
              </Title>
              <Text size="sm" c="dimmed" mb="md">
                Please provide contact information for someone we can reach in
                case of emergency.
              </Text>
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Emergency Contact Name"
                    placeholder="Enter full name"
                    leftSection={<IconUser size={16} />}
                    required
                    size="md"
                    {...form.getInputProps("emergencyContactName")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="Relationship"
                    placeholder="Select relationship"
                    data={relationshipOptions}
                    required
                    size="md"
                    {...form.getInputProps("emergencyRelationship")}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput
                    label="Emergency Contact Phone"
                    placeholder="Enter phone number"
                    leftSection={<IconPhone size={16} />}
                    required
                    size="md"
                    {...form.getInputProps("emergencyPhone")}
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
                    size="md"
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
                    size="md"
                    {...form.getInputProps("confirmPassword")}
                  />
                </Grid.Col>
              </Grid>
            </Box>

            <Divider />

            {/* Legal and Privacy Section */}
            <Box>
              <Title order={3} size="h4" mb="md" c="#1e293b">
                Legal & Privacy
              </Title>
              <Stack gap="md">
                <Checkbox
                  label={
                    <Text size="sm">
                      I accept the{" "}
                      <Button
                        variant="subtle"
                        size="xs"
                        p={0}
                        onClick={() => setTermsModalOpen(true)}
                        style={{ color: "#3b82f6" }}
                      >
                        Terms of Service
                      </Button>
                    </Text>
                  }
                  {...form.getInputProps("termsAccepted", { type: "checkbox" })}
                />
                <Checkbox
                  label={
                    <Text size="sm">
                      I accept the{" "}
                      <Button
                        variant="subtle"
                        size="xs"
                        p={0}
                        onClick={() => setPrivacyModalOpen(true)}
                        style={{ color: "#3b82f6" }}
                      >
                        Privacy Policy
                      </Button>
                    </Text>
                  }
                  {...form.getInputProps("privacyAccepted", {
                    type: "checkbox",
                  })}
                />
                <Checkbox
                  label={
                    <Text size="sm">
                      I consent to the{" "}
                      <Button
                        variant="subtle"
                        size="xs"
                        p={0}
                        onClick={() => setHipaaModalOpen(true)}
                        style={{ color: "#3b82f6" }}
                      >
                        HIPAA Privacy Practices
                      </Button>
                    </Text>
                  }
                  {...form.getInputProps("hipaaAccepted", { type: "checkbox" })}
                />
              </Stack>
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
              rightSection={!loading && <IconArrowRight size={18} />}
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                border: "none",
                borderRadius: "12px",
                fontWeight: 600,
                height: rem(56),
                fontSize: "16px",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
              }}
            >
              {loading ? "Creating Your Account..." : "Create My Account"}
            </Button>
          </Stack>
        </form>
      </Paper>

      {/* Modals */}
      <Modal
        opened={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        title="Terms of Service"
        size="lg"
      >
        <Stack gap="md">
          <Text size="sm">
            By creating an account, you agree to the following terms of service:
          </Text>
          <Text size="sm">
            1. You will provide accurate and truthful information.
          </Text>
          <Text size="sm">
            2. You are responsible for maintaining the security of your account.
          </Text>
          <Text size="sm">
            3. You will use the platform for legitimate healthcare purposes
            only.
          </Text>
          <Button
            onClick={() => setTermsModalOpen(false)}
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            }}
          >
            I Understand
          </Button>
        </Stack>
      </Modal>

      <Modal
        opened={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        title="Privacy Policy"
        size="lg"
      >
        <Stack gap="md">
          <Text size="sm">
            Our privacy policy explains how we collect, use, and protect your
            information:
          </Text>
          <Text size="sm">
            1. We collect only the information necessary to provide healthcare
            services.
          </Text>
          <Text size="sm">
            2. Your health information is protected under HIPAA regulations.
          </Text>
          <Text size="sm">
            3. We never sell or share your personal information with third
            parties.
          </Text>
          <Button
            onClick={() => setPrivacyModalOpen(false)}
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            }}
          >
            I Understand
          </Button>
        </Stack>
      </Modal>

      <Modal
        opened={hipaaModalOpen}
        onClose={() => setHipaaModalOpen(false)}
        title="HIPAA Privacy Practices"
        size="lg"
      >
        <Stack gap="md">
          <Text size="sm">
            HIPAA (Health Insurance Portability and Accountability Act) protects
            your health information:
          </Text>
          <Text size="sm">
            1. We may use and disclose your health information for treatment,
            payment, and healthcare operations.
          </Text>
          <Text size="sm">
            2. We will obtain your written authorization for other uses and
            disclosures.
          </Text>
          <Text size="sm">
            3. You have the right to request restrictions on certain uses and
            disclosures.
          </Text>
          <Button
            onClick={() => setHipaaModalOpen(false)}
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            }}
          >
            I Understand
          </Button>
        </Stack>
      </Modal>
    </Container>
  );
}
