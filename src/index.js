import React, {useEffect} from 'react';
import { differenceWith } from 'lodash';
import {render} from 'react-dom';
import PropTypes from 'prop-types';
import {Router, Switch, Route, Link} from 'react-router-dom';
import {createMemoryHistory} from 'history';
import {init, locations} from 'contentful-ui-extensions-sdk';
import {
    Heading,
    DisplayText,
    Paragraph,
    SectionHeading,
    TextInput,
    Textarea,
    FieldGroup,
    RadioButtonField,
    SelectField,
    Select,
    Option,
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
    constructor(props) {
        super(props)
        const {title, short, long, lessons} = props.sdk.entry.fields;

        this.state = {
            title: title.getValue(),
            short: short.getValue(),
            long: long.getValue(),
            lessons: lessons.getValue().lessons || [],
            duration: null,
            availableLessons: [],
        };
    }

    onInputChange = event => {
        const {name, value} = event.target;
        this.props.sdk.entry.fields[name].setValue(value);
        this.setState({[name]: value})
    }

    componentDidMount() {
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
            const lessons = [lessonToAdd, ...prevState.lessons]
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

            const availableLessons = [lessonToAdd, ...prevState.availableLessons]

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
                                    name="title"
                                    onChange={this.onInputChange}
                                    value={title}
                            />
                        </FieldGroup>
                        <SectionHeading>Short Course Description</SectionHeading>
                        <FieldGroup>
                            <TextInput
                                    name="short"
                                    onChange={this.onInputChange}
                                    value={short}
                            />
                        </FieldGroup>
                        <SectionHeading>Long Course Description</SectionHeading>
                        <FieldGroup>
                            <Textarea
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
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Short</TableCell>
                                    <TableCell>Duration</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {lessons.map((lesson,i) => {
                                    return <TableRow key={lesson.id}>
                                        <TableCell>
                                            {i !== 0 && <Icon
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
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {availableLessons.map(lesson => {
                                    return <TableRow key={lesson.id}>
                                        <TableCell>{lesson.title['en-US']}</TableCell>
                                        <TableCell>{lesson.short['en-US']}</TableCell>
                                        <TableCell>{lesson.estimatedDuration['en-US']} min</TableCell>
                                        <TableCell>
                                            <Button onClick={() => this.addLessonToCourse(lesson.id)}>
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
                            </TableBody>
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

PageExtension.propTypes = {
    sdk: PropTypes.object.isRequired
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
