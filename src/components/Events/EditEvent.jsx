import { Link, useNavigate, useParams } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchEvent, queryClient, updateEvent } from '../../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function EditEvent() {
  const params = useParams();
  const navigate = useNavigate();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }) // :id
  })

  const { mutate } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {
      const newEvent = data.event; // we are taking new event data and updating the events to take this data
      // cancel events query before setting to cancel any ongoing, it will cancel queries not the mutation 
      await queryClient.cancelQueries({ queryKey: ['events', params.id] })

      // rolling back old data in case of error occur from backend
      const previousEvent = queryClient.getQueryData(['events', params.id])

      // setting new event we are getting to the events
      queryClient.setQueryData(['events', params.id], newEvent);
      return { previousEvent }
    },
    onError: (error, data, context) => {
      // context will content previousEvent
      // rollback will happen here
      queryClient.setQueryData(['events', params.id], context.previousEvent)
    },
    onSettled: () => { // failed or succeed this will call, like finally of try, catch  
      queryClient.invalidateQueries(['events', params.id]);
    }
  });

  function handleSubmit(formData) {
    mutate({ id: params.id, event: formData });
    navigate('../')
  }

  function handleClose() {
    navigate('../');
  }

  let content;

  if (isPending) {
    content = (
      <div className="center">
        <LoadingIndicator />
      </div>
    )
  }

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to delete event"
          message={error.info?.message || 'Failed to delete event, please try again later.'} />

        <div className="form-actions">
          <Link to='../' className='button'>
            Okay
          </Link>
        </div>
      </>
    )
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    )
  }

  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}
