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
import {
  IconAt,
  IconCalendar,
  IconClock,
  IconMapPin,
  IconRepeat,
} from "@tabler/icons";
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

const Home: NextPage = () => {
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
      organizer_email: (value) =>
        /^\S+@\S+$/.test(value) ? null : "Invalid email",
    },
  });
  const handleClick = async () => {
    const response = await fetch("/api/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: form.values.summary,
        description: form.values.description,
        organizer_email: form.values.organizer_email,
        attendees_emails: form.values.attendees_emails,
        location: form.values.location,
        start_time: form.values.all_day
          ? "00:00"
          : dayjs(form.values.start_time).format("HH:mm"),
        end_time: form.values.all_day
          ? "00:00"
          : dayjs(form.values.end_time).format("HH:mm"),
        meeting_date: dayjs(form.values.meeting_date).format("DD-MM-YYYY"),
        recurring: form.values.recurrence !== "None",
        recurrence: form.values.recurrence !== "None" && {
          frequency: form.values.recurrence.toUpperCase(),
          count: form.values.recurrence_count,
        },
      }),
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "event.ics";
    a.click();
  };

  return (
    <Container size="sm">
      <Card withBorder m="xl" p="xl">
        <Title my="xl">Create iCal Event</Title>
        <form onSubmit={form.onSubmit(handleClick)}>
          <Stack spacing="xl">
            <TextInput
              withAsterisk
              label="Summary"
              placeholder="Summary"
              {...form.getInputProps("summary")}
            />
            <Textarea
              label="Description"
              placeholder="Description"
              {...form.getInputProps("description")}
            />
            <TextInput
              label="Organizer Email"
              placeholder="Organizer email"
              icon={<IconAt size={14} />}
              {...form.getInputProps("organizer_email")}
            />
            <MultiSelect
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
              icon={<IconMapPin size={14} />}
              label="Location"
              {...form.getInputProps("location")}
            />
            <DatePicker
              withAsterisk
              icon={<IconCalendar size={14} />}
              label="Date"
              {...form.getInputProps("meeting_date")}
            />
            <Checkbox label="All Day" {...form.getInputProps("all_day")} />
            <Group>
              <TimeInput
                icon={<IconClock size={14} />}
                label="Start Time"
                {...form.getInputProps("start_time")}
                disabled={form.values.all_day}
              />
              <TimeInput
                icon={<IconClock size={14} />}
                label="End Time"
                {...form.getInputProps("end_time")}
                disabled={form.values.all_day}
              />
            </Group>
            <Group>
              <Select
                icon={<IconRepeat size={14} />}
                {...form.getInputProps("recurrence")}
                label="Repeat"
                data={["None", "Daily", "Weekly", "Monthly", "Yearly"]}
              />
              <NumberInput
                {...form.getInputProps("recurrence_count")}
                min={0}
                label="Times"
                disabled={form.values.recurrence === "None"}
              />
            </Group>
            <Group position="right">
              <Button type="submit" onClick={handleClick}>
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
