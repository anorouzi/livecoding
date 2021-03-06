// This component renders the menu bar.

// Include React (with addons).
var React = require('react/addons');

// Include components.
var Avatar = require('./Avatar.jsx');

// Include libraries.
var PubSub = require('pubsub-js');
var util   = require('../util/util.js');

// Create the component.
var MenuBar = React.createClass({

	statics: {
		topics: function() {
			return {
				ItemClick: 'MenuBar_ItemClick',
				ModeChange: 'MenuBar_ModeChange'
			};
		}
	},

	// Set the initial state: no selected menu or item.
	getInitialState: function() {
		return {
			selectedMenu: null,
			selectedItem: null
		};
	},

	// Listen to click events. We need this to close the menu.
	componentDidMount: function() {
		document.addEventListener('click', this.handleDocumentClick);
	},

	componentWillUnmount: function() {
		document.removeEventListener('click', this.handleDocumentClick);
	},

	// Render the component.
	render: function() {

		var cx = React.addons.classSet;

		var self = this;

		// Create the mode items.
		var modeItems = ['html', 'javascript', 'css'].map(function(mode) {

			// Highlight the current mode.
			var isCurrent = self.props.mode === mode;

			var classes = cx({
				'current': isCurrent
			});

			return <li className={classes} key={mode}>
				<button onClick={self.handleModeClick} disabled={isCurrent}>{mode}</button>
			</li>;
		});

		var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

		var gistUrl = this.props.gistUrl;

		var saved = gistUrl ? <a href={gistUrl}>{gistUrl}</a> : null;

		var success = null;
		var savedMessage = this.props.savedMessage;
		if (savedMessage) {
			success = <span className='success' key={this.props.gistVersion}>saved</span>;
		}

		var dirty = this.props.isDirty ? <div className='dirty'>●</div> : null;

		return (
			<div className='menubar'>
				<Avatar user={this.props.user} userAvatarUrl={this.props.userAvatarUrl} />
				<ul className='menugroup file'>
					<li className={this.state.selectedMenu === 'file' ? 'current' : ''}>
						<button className='menubutton' onMouseEnter={this.handleMenuMouseEnter} onClick={this.handleMenuClick}>file</button>
						<ul className={'menu' + (this.state.selectedMenu === 'file' ? ' selected' : '')}>
							<li className={this.state.selectedMenu === 'file' && this.state.selectedItem === 'new' ? 'current' : ''}>
								<button onClick={this.handleItemClick} disabled={this.props.isBlank} className='menubutton' onMouseEnter={this.handleItemMouseEnter}>new</button>
							</li>
							<li className={this.state.selectedMenu === 'file' && this.state.selectedItem === 'save' ? 'current' : ''}>
								<button onClick={this.handleItemClick} disabled={this.props.isBlank} className='menubutton' onMouseEnter={this.handleItemMouseEnter}>save</button>
							</li>
						</ul>
					</li>
				</ul>
				<div className='saved'>
					{saved}
					<ReactCSSTransitionGroup transitionName='success' transitionLeave={false}>
						{success}
					</ReactCSSTransitionGroup>
				</div>
				<ul className='menugroup mode'>
					<li>
						<ul className='menu'>
							{modeItems}
						</ul>
					</li>
				</ul>
				{dirty}
			</div>
		);
	},

	// Convenience function.
	isOpen: function() {
		return this.getDOMNode().querySelector('.menugroup > li.current') !== null;
	},

	// Handle document clicks. If we click outside the menu, close menu.
	handleDocumentClick: function(e) {

		// This event will fire before all others.
		// If the target isn't one of the menu buttons,
		// set menu to closed.
		if (!this.getDOMNode().querySelector('.menugroup.file').contains(e.target)) {
			this.setState({
				selectedMenu: null,
				selectedItem: null
			});
		}
	},

	// Handle item hovers. Select the item.
	handleItemMouseEnter: function(e) {

		var button = e.currentTarget;

		var item = this.isOpen() && !button.disabled ? button.textContent : null;

		this.setState({
			selectedItem: item
		});
	},

	// Handle menu hovers. Deselect items and select the menu.
	handleMenuMouseEnter: function(e) {

		var menu = this.isOpen() ? e.currentTarget.textContent : null;

		this.setState({
			selectedMenu: menu,
			selectedItem: null
		});
	},

	// Handle item clicks.
	handleItemClick: function(e) {

		// Get the menu button.
		var itemButton = e.currentTarget;
		var menuButton = itemButton.parentNode.parentNode.parentNode.querySelector('button');

		// Publish the command.
		PubSub.publish(MenuBar.topics().ItemClick, [menuButton.textContent, itemButton.textContent].join(':'));

		// Close the menu.
		this.setState({
			selectedMenu: null,
			selectedItem: null
		});
	},

	// Handle menu clicks. Toggle the menu.
	handleMenuClick: function(e) {

		var menu = !this.isOpen() ? e.currentTarget.textContent : null;

		this.setState({
			selectedMenu: menu
		});
	},

	// Handle mode button click. Publish the command.
	handleModeClick: function(e) {
		PubSub.publish(MenuBar.topics().ModeChange, e.currentTarget.textContent);
	}

});

module.exports = MenuBar;