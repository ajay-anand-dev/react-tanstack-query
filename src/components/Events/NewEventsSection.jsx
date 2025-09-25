import { useQuery } from '@tanstack/react-query';

import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import EventItem from './EventItem.jsx';
import { fetchEvents } from '../../util/http.js';

export default function NewEventsSection() {

  const { data, isPending, isError, error } = useQuery({
    // data, isPending, isError, error, refetch
    queryKey: ['events', { max: 3 }], // to cache the data by that request, (identifier)
    queryFn: ({ signal, queryKey }) => fetchEvents({ signal, ...queryKey[1] }),
    // queryKey[1] this will access max
    // queryFn: ({ signal }) => fetchEvents({ signal, max: 3 }), // actual request
    staleTime: 0, // wait time for sending another request, it will wait 5 seconds and if something after that then it will re-run it
    // gcTime: 3000, // it will store data for a half minute only and after that it will be discarded, gcTime

  }); // loading state, potiential error

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock title="An error occurred" message={error.info?.message || 'Failed to fetch events.'} />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="new-events-section">
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
