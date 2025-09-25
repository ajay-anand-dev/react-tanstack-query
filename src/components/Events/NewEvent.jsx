import { Link, useNavigate } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useMutation } from '@tanstack/react-query';
import { createNewEvent, queryClient } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function NewEvent() {
  const navigate = useNavigate();

  // mutate will helps to send request
  const { mutate, isPending, isError, error } = useMutation({ // this will send request when we want to, not when we load the page
    mutationFn: createNewEvent,
    onSuccess: () => { // this will be executed, when mutate succeded
      queryClient.invalidateQueries({ queryKey: ['events'] }); // refetch so that it displays new data
      navigate('/events');
    }
  })

  function handleSubmit(formData) {
    mutate({ event: formData });
  }

  return (
    <Modal onClose={() => navigate('../')}>
      <EventForm onSubmit={handleSubmit}>
        {isPending && 'Submitting...'}
        {!isPending && (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Create
            </button>
          </>
        )}
      </EventForm>
      {isError && <ErrorBlock title="Failed to create event" message={error.info?.message || 'Failed to create event. Please check your inputs and try again later.'} />}
    </Modal>
  );
}
