import {
  Button,
  Card,
  Checkbox,
  Container,
  Group,
  MultiSelect,
  NumberInput,
  Select,
  Stack,
  Switch,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { DatePicker, TimeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import {
  IconAt,
  IconCalendar,
  IconClock,
  IconMapPin,
  IconRepeat,
} from "@tabler/icons";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import type { NextPage } from "next";

interface FormValues {
  summary: string;
  description: string;
  organizer_email: string;
  attendees_emails: string[];
  location: string;
  meeting_date: Date;
  start_time: Date;
  end_time: Date;
  all_day: boolean;
  recurrence: "None" | "Daily" | "Weekly" | "Monthly" | "Yearly";
  recurrence_count: number;
}

const postEvent = async (values: FormValues) => {
  const response = await fetch("/api/event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary: values.summary,
      description: values.description,
      organizer_email: values.organizer_email,
      attendees_emails: values.attendees_emails,
      location: values.location,
      start_time: values.all_day
        ? "00:00"
        : dayjs(values.start_time).format("HH:mm"),
      end_time: values.all_day
        ? "00:00"
        : dayjs(values.end_time).format("HH:mm"),
      meeting_date: dayjs(values.meeting_date).format("DD-MM-YYYY"),
      recurring: values.recurrence !== "None",
      recurrence:
        values.recurrence !== "None"
          ? {
              frequency: values.recurrence.toUpperCase(),
              count: values.recurrence_count,
            }
          : {},
    }),
  });
  if (response.ok) {
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "event.ics";
    a.click();
  } else {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
};

const Home: NextPage = () => {
  const { mutate, isLoading } = useMutation(postEvent, {
    onSuccess: () => {
      showNotification({
        title: "Success",
        color: "green",
        message: "Event created successfully",
      });
    },
    onError: (error: Error) => {
      showNotification({
        title: "Error",
        color: "red",
        message: error.message,
      });
    },
  });
  const form = useForm<FormValues>({
    initialValues: {
      summary: "",
      description: "",
      organizer_email: "",
      attendees_emails: [],
      location: "",
      meeting_date: new Date(),
      start_time: dayjs().hour(9).minute(0).toDate(),
      end_time: dayjs().hour(10).minute(0).toDate(),
      all_day: false,
      recurrence: "None",
      recurrence_count: 0,
    },
    validate: {
      summary: (value) => (value ? null : "Summary is required"),
      meeting_date: (value) => {
        if (!value) {
          return "Meeting date is required";
        }
      },
      // organizer_email can be empty or a valid email
      organizer_email: (value) =>
        value && !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
          ? "Invalid email"
          : null,
    },
  });

  return (
    <Container size="sm">
      <Card withBorder m="xl" p="xl">
        <Title my="xl">Create iCal Event</Title>
        <form onSubmit={form.onSubmit((values) => mutate(values))}>
          <Stack spacing="xl">
            <TextInput
              disabled={isLoading}
              withAsterisk
              label="Summary"
              placeholder="Summary"
              {...form.getInputProps("summary")}
            />
            <Textarea
              disabled={isLoading}
              label="Description"
              placeholder="Description"
              {...form.getInputProps("description")}
            />
            <TextInput
              disabled={isLoading}
              label="Organizer Email"
              placeholder="Organizer email"
              icon={<IconAt size={14} />}
              {...form.getInputProps("organizer_email")}
            />
            <MultiSelect
              disabled={isLoading}
              icon={<IconAt size={14} />}
              data={form.values.attendees_emails}
              getCreateLabel={(query) => `+ Add ${query}`}
              onCreate={(query) => {
                if (/^\S+@\S+$/.test(query)) {
                  form.setValues({
                    attendees_emails: [...form.values.attendees_emails, query],
                  });
                  return query;
                } else {
                  form.setFieldError("attendees_emails", "Invalid email");
                }
              }}
              error={form.errors.attendees_emails}
              label="Attendees Emails"
              creatable
              searchable
            />
            <TextInput
              disabled={isLoading}
              icon={<IconMapPin size={14} />}
              label="Location"
              {...form.getInputProps("location")}
            />
            <DatePicker
              disabled={isLoading}
              withAsterisk
              icon={<IconCalendar size={14} />}
              label="Date"
              {...form.getInputProps("meeting_date")}
            />
            <Checkbox
              disabled={isLoading}
              label="All Day"
              {...form.getInputProps("all_day")}
            />
            <Group>
              <TimeInput
                icon={<IconClock size={14} />}
                label="Start Time"
                {...form.getInputProps("start_time")}
                disabled={form.values.all_day || isLoading}
              />
              <TimeInput
                icon={<IconClock size={14} />}
                label="End Time"
                {...form.getInputProps("end_time")}
                disabled={form.values.all_day || isLoading}
              />
            </Group>
            <Group>
              <Select
                icon={<IconRepeat size={14} />}
                {...form.getInputProps("recurrence")}
                label="Repeat"
                data={["None", "Daily", "Weekly", "Monthly", "Yearly"]}
                disabled={isLoading}
              />
              <NumberInput
                {...form.getInputProps("recurrence_count")}
                min={0}
                label="Times"
                disabled={form.values.recurrence === "None" || isLoading}
              />
            </Group>
            <Group position="right">
              <Button type="submit" loading={isLoading}>
                Create Event
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Container>
  );
};

export default Home;
