import React from 'react';
import { PageExtension } from './index';
import {render, fireEvent, cleanup, configure, shallowWrapper} from '@testing-library/react';

configure({
    testIdAttribute: 'data-test-id'
});

function renderComponent(sdk) {
    return render(<PageExtension sdk={sdk}/>);
}

const mockLessons = [{
    "title": {"en-US": "Basic PHP"},
    "short": {"en-US": "Basically Magic"},
    "estimatedDuration": {"en-US": 43},
    "id": "4hXFXftOgcZxl3k2Iol6l4"
}, {
    "title": {"en-US": "Basic Javascript"},
    "short": {"en-US": "Punching the monkey!"},
    "estimatedDuration": {"en-US": 34},
    "id": "6zaLLDDy2lbJZ2ri8OIIgR"
}, {
    "title": {"en-US": "Basic HTML"},
    "short": {"en-US": "HTML Basics to get you started"},
    "estimatedDuration": {"en-US": 60},
    "id": "1LpK13S4Ir1t9RgUo7m5uG"
}, {
    "title": {"en-US": "Basic CSS"},
    "short": {"en-US": "CSS stands for cascading style sheets, find out why!"},
    "estimatedDuration": {"en-US": 45},
    "id": "R578k39jvWYp4s348EWwA"
}];


const sdk = {
    entry: {
        fields: {
            title: {getValue: jest.fn(), setValue: jest.fn()},
            short: {getValue: jest.fn(), setValue: jest.fn()},
            long: {getValue: jest.fn(), setValue: jest.fn()},
            lessons: {getValue: jest.fn(), setValue: jest.fn()},
            availableLessons: {getValue: jest.fn(), setValue: jest.fn()},
            duration: {getValue: jest.fn(), setValue: jest.fn()}
        }
    }
};

describe('Course Scheduler Page Extension', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    afterEach(cleanup);

    describe('Field reading and setting', () => {
        const createItBlockText = (field) => {
            return `should read and set ${field} value from entry.fields.${field}`;
        }

        it(createItBlockText('Title'), () => {
            sdk.entry.fields.title.getValue.mockReturnValue('cool title');

            const {getByTestId} = renderComponent(sdk);

            expect(getByTestId('field-title').value).toEqual('cool title');

            fireEvent.change(getByTestId('field-title'), {
                target: {value: 'awesome title'}
            });

            expect(sdk.entry.fields.title.setValue).toHaveBeenCalledWith('awesome title');
        });

        it(createItBlockText('Short'), () => {
            sdk.entry.fields.short.getValue.mockReturnValue('short and sweet');

            const {getByTestId} = renderComponent(sdk);

            expect(getByTestId('field-short').value).toEqual('short and sweet');

            fireEvent.change(getByTestId('field-short'), {
                target: {value: 'still short, but bitter'}
            });

            expect(sdk.entry.fields.short.setValue).toHaveBeenCalledWith('still short, but bitter');
        });

        it(createItBlockText('Long'), () => {
            sdk.entry.fields.long.getValue.mockReturnValue('Bacon ipsum dolor amet boudin capicola sirloin doner ground round leberkas burgdoggen shoulder jowl. Doner strip steak fatback beef ribs sirloin corned beef sausage biltong pork buffalo ham pork belly porchetta kielbasa cupim. ');

            const {getByTestId} = renderComponent(sdk);

            expect(getByTestId('field-long').value).toEqual('Bacon ipsum dolor amet boudin capicola sirloin doner ground round leberkas burgdoggen shoulder jowl. Doner strip steak fatback beef ribs sirloin corned beef sausage biltong pork buffalo ham pork belly porchetta kielbasa cupim. ');

            fireEvent.change(getByTestId('field-long'), {
                target: {value: 'a shorter long'}
            });

            expect(sdk.entry.fields.long.setValue).toHaveBeenCalledWith('a shorter long');
        });

        it('should read and render lessons from entry.fields.lessons', () => {
            sdk.entry.fields.lessons.getValue.mockReturnValue({
                lessons: mockLessons
            });

            const {getAllByTestId} = renderComponent(sdk);

            expect(getAllByTestId('lesson').length).toEqual(mockLessons.length);
        });
    });

    describe('Lesson Array Manipulation', () => {
        it('should remove lesson from entry.fields.lessons when remove is clicked', () => {

            sdk.entry.fields.lessons.getValue.mockReturnValue({
                lessons: mockLessons
            });

            const {getAllByTestId} = renderComponent(sdk);

            const initialLessonsLength = getAllByTestId('lesson').length;

            expect(initialLessonsLength).toEqual(mockLessons.length);

            const removeHandlers = getAllByTestId('lesson-remove');

            fireEvent.click(removeHandlers[0])
            expect(getAllByTestId('lesson').length).toEqual(initialLessonsLength - 1);

            fireEvent.click(removeHandlers[1])
            expect(getAllByTestId('lesson').length).toEqual(initialLessonsLength - 2);

            fireEvent.click(removeHandlers[2])
            expect(getAllByTestId('lesson').length).toEqual(initialLessonsLength - 3);
        })

        it('should move clicked lesson up when move-up is clicked', () => {

            sdk.entry.fields.lessons.getValue.mockReturnValue({
                lessons: mockLessons
            });

            const {getAllByTestId} = renderComponent(sdk);

            const initialLessons = getAllByTestId('lesson');

            expect(initialLessons.length).toEqual(mockLessons.length);

            const moveUpHandlers = getAllByTestId('lesson-move-up');

            fireEvent.click(moveUpHandlers[1])
            expect(getAllByTestId('lesson')[0].key).toEqual(initialLessons[1].key);

            fireEvent.click(moveUpHandlers[2])
            expect(getAllByTestId('lesson')[1].key).toEqual(initialLessons[2].key);
        })

        it('should move clicked lesson down when move-down is clicked', () => {
            sdk.entry.fields.lessons.getValue.mockReturnValue({
                lessons: mockLessons
            });

            const {getAllByTestId} = renderComponent(sdk);

            const initialLessons = getAllByTestId('lesson');

            expect(initialLessons.length).toEqual(mockLessons.length);

            const moveDownHandlers = getAllByTestId('lesson-move-down');

            fireEvent.click(moveDownHandlers[0])
            expect(getAllByTestId('lesson')[1].key).toEqual(initialLessons[0].key);
            expect(getAllByTestId('lesson')[0].key).toEqual(initialLessons[1].key);

            fireEvent.click(moveDownHandlers[2])
            expect(getAllByTestId('lesson')[3].key).toEqual(initialLessons[2].key);
            expect(getAllByTestId('lesson')[2].key).toEqual(initialLessons[3].key);

        })

        it('should add available lesson to lessons array when add is clicked', () => {
            sdk.entry.fields.availableLessons.getValue.mockReturnValue(mockLessons);
            sdk.entry.fields.lessons.getValue.mockReturnValue({
                lessons: []
            });

            const { getAllByTestId } = renderComponent(sdk);

            const lessonsAvailable = () => getAllByTestId('available-lesson');
            const lessons = () => getAllByTestId('lesson');
            const addLessonHandlers = getAllByTestId('available-lesson-add');

            expect(lessonsAvailable().length).toEqual(mockLessons.length);

            let lessonToAddsKey = lessonsAvailable()[0].key
            fireEvent.click(addLessonHandlers[0]);

            expect(lessonsAvailable().length).toEqual(mockLessons.length - 1);
            expect(lessons().length).toEqual(1);
            expect(lessons()[0].key).toEqual(lessonToAddsKey);

            lessonToAddsKey = lessonsAvailable()[1].key
            fireEvent.click(addLessonHandlers[1]);

            expect(lessonsAvailable().length).toEqual(mockLessons.length - 2);
            expect(lessons().length).toEqual(2);
            expect(lessons()[1].key).toEqual(lessonToAddsKey);
        })
    })
});
