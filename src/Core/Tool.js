import React, { Component } from 'react';
import {
  PencilIcon,
  ClockIcon,
  InformationCircleIcon,
  DuplicateIcon,
} from '@heroicons/react/outline';

import { Helmet } from 'react-helmet';

import Header from '../Components/Header';
import Body, { Grid, Col } from '../Components/Body';
import Button from '../Components/Button';
import Output from '../Components/Output';
import Countdown from 'react-countdown';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { observable, makeObservable, computed } from 'mobx';
import { observer, inject } from 'mobx-react';

import EntryTabs from '../Components/EntryTabs';
import EntryPrompt from '../Components/EntryPrompt';
import EntryInput from '../Components/EntryInput';
import EntryN from '../Components/EntryN';

import Filter from 'bad-words';
import Tooltip from '@mui/material/Tooltip';

let filterBadWords = new Filter();

const withRouter = (Component) => (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  return (
    <Component
      {...props}
      location={location}
      navigate={navigate}
      params={params}
    />
  );
};

@inject('store')
@observer
class Tool extends Component {
  @observable tool = {};

  @observable.deep prompts = [];
  @observable currentPrompt = 0;
  @observable currentOption = 'Start Using';

  @observable error = '';

  @observable output = '';
  @observable outputs = [];
  @observable code = '';

  @observable loading = false;

  @observable date = Date.now() + 1000;
  countdown = [];

  constructor(props) {
    super(props);
    console.log(this.props);
    makeObservable(this);

    this.tool = this.props.store.getToolByUrl(this.props.location.pathname);
    if (!this.tool) {
      window.location.href = '/';
    } else {
      this.prompts = [...this.tool.prompts];
    }
  }

  handleCurrentPrompt = (val) => {
    this.currentPrompt = val;
  };

  get isGenerateButtonDisabled() {
    if (this.loading) {
      return true;
    }

    return false;
  }

  get disabled() {
    if (this.prompts[this.currentPrompt].prompts[0].value.length < 1) {
      return true;
    }

    // this.prompts[this.currentPrompt].prompts[promptIndex].value
    return false;
  }

  get isMinLength() {
    if (!this.props.prompt.min) {
      return false;
    }
    if (!this.props.prompt.type === 'number') {
      return false;
    }

    return false;
  }

  checkMinimumPrompts = () => {
    let shouldReturn = false;

    this.prompts[this.currentPrompt].prompts.forEach((prompt, promptIndex) => {
      if (prompt.min) {
        if (prompt.value.length < prompt.min) {
          shouldReturn = true;
          prompt.error = `${prompt.title} needs to meet the minimum ${prompt.min} characters`;
        }
      }
    });

    return shouldReturn;
  };

  clearExampleTimeout = [];

  onStartUsing = async () => {
    this.loading = false;
    this.error = '';
    this.clearExampleTimeout.forEach((item, index) => {
      clearTimeout(this.clearExampleTimeout[index]);
    });
    this.currentOption = 'Start Using';
  };

  onExample = async () => {
    this.loading = true;
    this.error = '';
    this.output = '';
    this.outputs = [];
    this.code = ``;

    this.currentOption = 'Example';

    let totalLength = 0;

    this.clearExampleTimeout.forEach((item, index) => {
      clearTimeout(this.clearExampleTimeout[index]);
    });

    this.prompts[this.currentPrompt].prompts.forEach((prompt, promptIndex) => {
      this.prompts[this.currentPrompt].prompts[promptIndex].value = '';
    });

    this.prompts[this.currentPrompt].prompts.forEach((prompt, promptIndex) => {
      for (
        let timeoutIndex = 0;
        timeoutIndex < prompt.example.length;
        timeoutIndex++
      ) {
        totalLength++;
        this.clearExampleTimeout[totalLength] = setTimeout(() => {
          this.prompts[this.currentPrompt].prompts[promptIndex].value +=
            prompt.example[timeoutIndex];
        }, 7 * totalLength);
      }
    });

    totalLength++;

    if (this.prompts[this.currentPrompt].example.output) {
      this.clearExampleTimeout[totalLength] = setTimeout(() => {
        this.output = this.prompts[this.currentPrompt].example.output;
        totalLength++;
        this.clearExampleTimeout[totalLength] = setTimeout(() => {
          this.loading = false;
          this.currentOption = 'Start Using';
          this.prompts[this.currentPrompt].prompts[0].value += ' ';
        }, 7 * totalLength + this.prompts[this.currentPrompt].example.output.length * 7 + 500);
      }, 7 * totalLength + 500);
    }

    if (this.prompts[this.currentPrompt].example.code) {
      totalLength++;
      this.clearExampleTimeout[totalLength] = setTimeout(() => {
        this.code = `${this.prompts[this.currentPrompt].example.code}`;
        this.loading = false;
      }, 7 * totalLength + 500);
    }

    if (this.prompts[this.currentPrompt].example.outputs) {
      this.clearExampleTimeout[totalLength] = setTimeout(() => {
        this.outputs = this.prompts[this.currentPrompt].example.outputs;

        totalLength++;
        this.clearExampleTimeout[totalLength] = setTimeout(() => {
          this.loading = false;
          this.currentOption = 'Start Using';
          // this.prompts[this.currentPrompt].prompts[0].value += " "
        }, 7 * totalLength + 500);
      }, 7 * totalLength + 500);
    }
  };

  sanitizeAllPrompts = () => {
    this.prompts[this.currentPrompt].prompts.forEach((prompt) => {
      if (!prompt.value) {
        return false;
      }
      if (prompt.type === 'number') {
        return false;
      }

      prompt.value = prompt.value.trim();

      if (filterBadWords.isProfane(prompt.value)) {
        prompt.error = 'Unsafe content , please try different language';
        throw Error('Unsafe content');
      }
    });
  };

  contentFilterFlagged = async (response) => {
    this.error = response.message;

    this.date = Date.now() + 5000;
    this.countdown.forEach((countdown) => {
      if (countdown) {
        countdown.stop();
        countdown.start();
      }
    });
    this.loading = false;
  };

  checkOutput = (output) => {
    if (output) {
      output = output.replace(/^\s+|\s+$/g, '');
      // output = output.replace(/\s{2,}/g, ' ')
    }
    return output;
  };

  get language() {
    let language = '';
    this.prompts[this.currentPrompt].prompts.forEach((prompt) => {
      if (prompt.attr === 'language') {
        language = `${prompt.value}`;
      }
    });
    return language;
  }

  onGenerateClick = async () => {
    try {
      this.error = '';
      this.output = '';
      this.code = ``;
      this.outputs = [];
      this.loading = true;

      let checkMinimumPrompts = this.checkMinimumPrompts();
      if (checkMinimumPrompts) {
        this.loading = false;
        return false;
      }
      // this.sanitizeAllPrompts()

      let postObj = {};

      this.prompts[this.currentPrompt].prompts.forEach((prompt) => {
        postObj[prompt.attr] = prompt.value;
      });

      postObj.currentPrompt = this.prompts[this.currentPrompt].title;
      if (this.prompts[this.currentPrompt].n) {
        postObj.n = this.prompts[this.currentPrompt].n;
      }

      let response = await this.props.store.api.post(this.tool.api, postObj);

      if (!response.data.success) {
        this.contentFilterFlagged(response.data);
        return false;
      }

      if (response.data.output) {
        this.output = this.checkOutput(response.data.output);
      }

      if (response.data.code) {
        this.code = response.data.code;
      }

      if (response.data.outputs) {
        this.outputs = response.data.outputs;
      }

      this.date = Date.now() + 10000;
      this.countdown.forEach((countdown) => {
        if (countdown) {
          countdown.stop();
          countdown.start();
        }
      });
      this.loading = false;
    } catch (error) {
      console.log(error);
      this.countdown.forEach((countdown) => {
        if (countdown) {
          countdown.stop();
          countdown.start();
        }
      });
      this.loading = false;
    }
  };

  render() {
    // required for mobx to pick up deeply nested value
    const currentValue = this.prompts[this.currentPrompt].prompts[0].value;
    return (
      <div>
        <Helmet>
          <title>{`${this.tool.title} Tool - AI`}</title>
        </Helmet>
        <Body>
          <div style={{ fontSize: 'xx-large', marginBottom: '50px' }}>
            &nbsp;&nbsp;{this.tool.title}&nbsp;&nbsp;
            <div class="word-used-wrapper">
              <i className="fa fa-bar-chart"></i>
              <i id="quick-words-left">0</i> / 100,000
              <strong> Words Used</strong>
            </div>
          </div>
          <div class="row">
            <Col span="4">
              <EntryTabs
                prompts={this.prompts}
                currentPrompt={this.currentPrompt}
                onChange={this.handleCurrentPrompt}
              />

              {this.prompts.map((prompt, index) => (
                <EntryPrompt
                  prompt={prompt}
                  key={index}
                  index={index}
                  disabled={this.disabled}
                  currentPrompt={this.currentPrompt}
                >
                  {prompt.prompts.map((promptInput, index) => (
                    <EntryInput
                      prompt={promptInput}
                      key={index}
                      language={this.language}
                      index={index}
                      disabled={this.disabled}
                    />
                  ))}

                  <div className="md:flex">
                    <Countdown
                      ref={(countdown) => (this.countdown[index] = countdown)}
                      date={this.date}
                      renderer={(props) => (
                        <Button
                          title={
                            props.total
                              ? `Timeout ${props.total / 1000} secs`
                              : 'Generate'
                          }
                          disabled={
                            props.total || this.isGenerateButtonDisabled
                          }
                          Icon={
                            props.total
                              ? ClockIcon
                              : currentValue
                              ? DuplicateIcon
                              : PencilIcon
                          }
                          onClick={this.onGenerateClick}
                        />
                      )}
                    />
                    <EntryN
                      prompts={this.prompts}
                      currentPrompt={this.currentPrompt}
                    />
                  </div>

                  {this.error && (
                    <div className="mt-4">
                      <label
                        className={`${
                          this.error ? 'text-red-400' : 'text-gray-400'
                        } font-medium transition-all`}
                      >
                        {this.error}
                      </label>
                    </div>
                  )}
                </EntryPrompt>
              ))}
            </Col>
            <Col span="8">
              <Output
                title={this.tool.output.title}
                desc={this.tool.output.desc}
                Icon={this.tool.output.Icon || this.tool.Icon}
                fromColor={this.tool.fromColor}
                toColor={this.tool.toColor}
                loading={this.loading}
                output={this.output}
                outputs={this.outputs}
                code={this.code}
                language={this.language}
                outputsColor={this.tool.output.color}
                OutputsIcon={this.tool.output.Icon}
              />
            </Col>
          </div>
        </Body>
      </div>
    );
  }
}

export default withRouter(Tool);
