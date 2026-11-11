// One .ics file per upcoming event, written at build time for "Add to calendar"
// (Apple Calendar and Outlook). Served at /events/<notion page id>.ics.

import type { APIRoute, GetStaticPaths } from "astro";
import eventsData from "../../data/events.json";
import { icsText, type CalEvent } from "../../calendar";

type RawEvent = CalEvent & { where: string; area: string[] };

export const getStaticPaths: GetStaticPaths = () =>
  (eventsData as RawEvent[]).map((e) => ({
    params: { id: e.id },
    props: {
      event: {
        id: e.id,
        name: e.name,
        start: e.start,
        end: e.end,
        allDay: e.allDay,
        link: e.link,
        location: e.where || e.area.join(", "),
      } satisfies CalEvent,
    },
  }));

export const GET: APIRoute = ({ props }) =>
  new Response(icsText(props.event as CalEvent), {
    headers: { "Content-Type": "text/calendar; charset=utf-8" },
  });
