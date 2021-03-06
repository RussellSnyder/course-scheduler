import React from 'react';
import differenceWith from 'lodash.differencewith';
import {render} from 'react-dom';
import PropTypes from 'prop-types';
import {init, locations} from 'contentful-ui-extensions-sdk';
import {
    SectionHeading,
    TextInput,
    Textarea,
    FieldGroup,
    Form,
    Table,
    TableHead,
    TableCell,
    TableBody,
    TableRow,
    Button,
    Icon
} from '@contentful/forma-36-react-components';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss/dist/styles.css';
import './index.css';

function parseLesson(lesson) {
    const {title, short, estimatedDuration} = lesson.fields;
    const {id} = lesson.sys
    return {
        title,
        short,
        estimatedDuration,
        id
    }
}

export class PageExtension extends React.Component {
    static propTypes = {
        sdk: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props)
        const {title, short, long, lessons, availableLessons} = props.sdk.entry.fields;

        this.state = {
            title: title.getValue(),
            short: short.getValue(),
            long: long.getValue(),
            lessons: lessons.getValue() ? lessons.getValue().lessons : null,
            duration: null,
            availableLessons: availableLessons ? availableLessons.getValue() : []
        };
    }

    onInputChange = event => {
        const {name, value} = event.target;
        this.props.sdk.entry.fields[name].setValue(value);
        this.setState({[name]: value})
    }

    componentDidMount() {
        if (!this.props.sdk.space) return; // for testing purposes

        this.props.sdk.space.getEntries({
            'content_type': 'courseLesson'
        }).then(response => {
            return response.items.map(lesson => parseLesson(lesson))
        }).then(availableLessons => {
            return differenceWith(availableLessons, this.state.lessons, (a,b) => {
                return a.id === b.id
            })
        }).then(availableLessons => {
            this.setState({availableLessons})
        })
    }

    setLessonJsonObject() {
        let { lessons } = this.state;
        this.props.sdk.entry.fields.lessons.setValue({
            lessons: [...lessons]
        })
    }

    addLessonToCourse(id) {
        this.setState(prevState => {
            let lessonToAdd = prevState.availableLessons.find(lesson => lesson.id === id)
            const lessons = prevState.lessons ? [lessonToAdd, ...prevState.lessons] : [lessonToAdd]
            const availableLessons = prevState.availableLessons.filter(lesson => lesson.id !== id)


            return {
                ...prevState,
                lessons,
                availableLessons
            }
        }, () => this.setLessonJsonObject())
    }

    removeLessonFromCourse(id) {
        this.setState(prevState => {
            let lessonToAdd = prevState.lessons.find(lesson => lesson.id === id)
            let lessons = prevState.lessons.filter(lesson => lesson.id !== id)

            const availableLessons = prevState.availableLessons
                    ? [lessonToAdd, ...prevState.availableLessons]
                    : [lessonToAdd]

            this.props.sdk.entry.fields.lessons.setValue(lessons);

            return {
                ...prevState,
                lessons,
                availableLessons
            }
        }, () => this.setLessonJsonObject())
    }

    moveLesson(id, direction) {
        this.setState(prevState => {
            const index = prevState.lessons.findIndex(lesson => lesson.id === id);
            const newIndex = index + direction;
            const lessons = array_move(prevState.lessons, index, newIndex)

            return {
                ...prevState,
                lessons
            }
        })
    }

    render = () => {
        const {title, short, long, availableLessons, lessons, duration} = this.state

        return (
                <>
                    <Form className="f36-margin--l">
                        <SectionHeading>Course Title</SectionHeading>
                        <FieldGroup>
                            <TextInput
                                    testId="field-title"
                                    name="title"
                                    onChange={this.onInputChange}
                                    value={title}
                            />
                        </FieldGroup>
                        <SectionHeading>Short Course Description</SectionHeading>
                        <FieldGroup>
                            <TextInput
                                    testId="field-short"
                                    name="short"
                                    onChange={this.onInputChange}
                                    value={short}
                            />
                        </FieldGroup>
                        <SectionHeading>Long Course Description</SectionHeading>
                        <FieldGroup>
                            <Textarea
                                    testId="field-long"
                                    rows={5}
                                    name="long"
                                    onChange={this.onInputChange}
                                    value={long}
                            />
                        </FieldGroup>
                        {lessons && lessons.length > 0 &&
                        <SectionHeading>Lessons Included | Total
                            Duration: {lessons.reduce((accum, curr) => accum += parseInt(curr.estimatedDuration['en-US']), 0)} min
                        </SectionHeading>
                        }
                        {lessons && lessons.length > 0 &&
                        <Table data-test-id="field-lessons">
                            <TableHead>
                                <TableRow>
                                    <TableCell/>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Short</TableCell>
                                    <TableCell>Duration</TableCell>
                                    <TableCell/>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {lessons.map((lesson,i) => {
                                    return <TableRow
                                            key={lesson.id}
                                            data-test-id="lesson"
                                    >
                                        <TableCell>
                                            {i !== 0 && <Icon
                                                    data-test-id="lesson-move-up"
                                                    size="large"
                                                    onClick={() => this.moveLesson(lesson.id, -1)}
                                                    style={{
                                                        fill: 'linear-gradient(0deg,#3c80cf,#5b9fef)',
                                                        margin: "0 auto -20px",
                                                        display: 'block',
                                                        cursor: 'pointer'
                                                    }}
                                                    icon="ArrowUp">
                                            </Icon>}
                                            {i < lessons.length - 1 && <Icon
                                                    data-test-id="lesson-move-down"
                                                    size="large"
                                                    onClick={() => this.moveLesson(lesson.id, 1)}
                                                    style={{
                                                        fill: 'linear-gradient(0deg,#3c80cf,#5b9fef)',
                                                        margin: "auto",
                                                        display: 'block',
                                                        cursor: 'pointer'
                                                    }}
                                                    icon="ArrowDown">
                                            </Icon>}
                                        </TableCell>
                                        <TableCell>{lesson.title['en-US']}</TableCell>
                                        <TableCell>{lesson.short['en-US']}</TableCell>
                                        <TableCell>{lesson.estimatedDuration['en-US']}</TableCell>
                                        <TableCell>
                                            <Button
                                                    data-test-id="lesson-remove"
                                                    buttonType="negative"
                                                    onClick={() => this.removeLessonFromCourse(lesson.id)}>
                                                Remove Lesson
                                                <Icon style={{
                                                    fill: 'white',
                                                    verticalAlign: "middle",
                                                    marginLeft: "5px"
                                                }} icon="Close">close</Icon>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                })}
                            </TableBody>
                        </Table>
                        }

                        <SectionHeading>Available Lessons</SectionHeading>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Short</TableCell>
                                    <TableCell>Duration</TableCell>
                                    <TableCell/>
                                </TableRow>
                            </TableHead>
                            {availableLessons && <TableBody>
                                {availableLessons.map(lesson => {
                                    return <TableRow
                                            key={lesson.id}
                                            data-test-id="available-lesson"
                                    >
                                        <TableCell>{lesson.title['en-US']}</TableCell>
                                        <TableCell>{lesson.short['en-US']}</TableCell>
                                        <TableCell>{lesson.estimatedDuration['en-US']} min</TableCell>
                                        <TableCell>
                                            <Button
                                                    data-test-id="available-lesson-add"
                                                    onClick={() => this.addLessonToCourse(lesson.id)}>
                                                Add Lesson
                                                <Icon style={{
                                                    fill: 'white',
                                                    verticalAlign: "middle",
                                                    marginLeft: "5px"
                                                }} icon="Plus">plus</Icon>
                                            </Button>
                                        </TableCell>
                                        {/*<TableCell>{lesson.id}</TableCell>*/}
                                    </TableRow>
                                })}
                            </TableBody>}
                        </Table>
                    </Form>
                </>
        );
    };
}


// from https://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
function array_move(arr, old_index, new_index) {
    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
};

init(sdk => {
    render(<PageExtension sdk={sdk}/>, document.getElementById('root'));
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
